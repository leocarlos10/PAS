package backend.security_alert.service;

import backend.security_alert.models.Alerta;
import backend.security_alert.models.Evento;
import backend.security_alert.models.User;
import backend.security_alert.repository.AlertaRepository;
import backend.security_alert.repository.UserRepository;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.type.PhoneNumber;
import com.twilio.type.Twiml;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Servicio de alertas por llamada telefónica con cola de eventos y cooldown por zona.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CallAlertService {

    private final AlertaRepository alertaRepository;
    private final UserRepository userRepository;

    @Value("${twilio.account.sid}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token}")
    private String twilioAuthToken;

    @Value("${twilio.phone.from}")
    private String twilioNumber;

    @Value("${app.server.url}")
    private String serverUrl;

    // ─── ESTADO GLOBAL ────────────────────────────────────────────────────────
    private final AtomicBoolean llamadaActiva = new AtomicBoolean(false);
    private final AtomicInteger intentos = new AtomicInteger(0);
    private static final int MAX_INTENTOS = 3;
    private static final int COOLDOWN_SEGUNDOS = 60; // No repetir llamada para la misma zona en 1 min

    private Evento eventoActual = null;
    private User usuarioActual = null;
    private LocalDateTime inicioLlamadaActual = null;

    // ─── CONTROL DE ZONAS (Cooldown) ──────────────────────────────────────────
    private final Map<Long, LocalDateTime> ultimaAlertaPorZona = new ConcurrentHashMap<>();

    // ─── COLA DE EVENTOS ──────────────────────────────────────────────────────
    private final Queue<Evento> colaEventosPendientes = new LinkedList<>();
    private Queue<User> colaAdmins = new LinkedList<>();

    /**
     * Procesa un nuevo evento crítico.
     */
    public synchronized void procesarEvento(Evento evento) {
        Long zonaId = evento.getZona().getId();
        LocalDateTime ahora = LocalDateTime.now();

        // 1. SIEMPRE registrar en historial (Alerta)
        alertaRepository.save(construirAlerta(evento));

        // 2. CONTROL DE COOLDOWN: Evitar saturación si el sensor dispara muchas veces
        if (ultimaAlertaPorZona.containsKey(zonaId)) {
            LocalDateTime ultimaVez = ultimaAlertaPorZona.get(zonaId);
            if (ahora.isBefore(ultimaVez.plusSeconds(COOLDOWN_SEGUNDOS))) {
                log.info("⏳ Zona {} en cooldown ({}s). Ignorando disparo para llamada.", 
                        zonaId, COOLDOWN_SEGUNDOS);
                return;
            }
        }

        // 3. ENCOLAR
        ultimaAlertaPorZona.put(zonaId, ahora);
        colaEventosPendientes.add(evento);
        log.info("📋 Evento añadido a cola (Zona: {}). Pendientes en cola: {}", 
                zonaId, colaEventosPendientes.size());

        // 4. DISPARAR si está libre
        if (!llamadaActiva.get()) {
            procesarSiguienteEnCola();
        } else {
            log.info("⏸️  Sistema ocupado. El evento de zona {} esperará su turno.", zonaId);
        }
    }

    /**
     * Tarea de limpieza programada (CADA 1 MINUTO).
     * Si una llamada lleva más de 2 minutos "activa" sin recibir callback, se resetea por seguridad.
     */
    @Scheduled(fixedDelay = 60000)
    public synchronized void limpiarLlamadasEstancadas() {
        if (llamadaActiva.get() && inicioLlamadaActual != null) {
            if (LocalDateTime.now().isAfter(inicioLlamadaActual.plusMinutes(2))) {
                log.warn("⚠️ Detectada llamada estancada (sin callback de Twilio). Reseteando servicio...");
                terminarEventoActual();
            }
        }
    }

    private synchronized void procesarSiguienteEnCola() {
        if (colaEventosPendientes.isEmpty()) {
            liberarBloqueo();
            return;
        }

        eventoActual = colaEventosPendientes.poll();
        intentos.set(0);
        inicioLlamadaActual = LocalDateTime.now();
        cargarColaAdmins();
        
        if (colaAdmins.isEmpty()) {
            log.error("❌ No hay admins activos para procesar el evento.");
            alertaRepository.marcarFallida(eventoActual.getId(), LocalDateTime.now());
            procesarSiguienteEnCola();
            return;
        }

        hacerLlamada();
    }

    private void hacerLlamada() {
        llamadaActiva.set(true);
        int intento = intentos.incrementAndGet();
        String nombreZona = eventoActual.getZona().getNombre();

        if (colaAdmins.isEmpty()) {
            terminarEventoActual();
            return;
        }

        usuarioActual = colaAdmins.peek();
        String telefonoDestino = formatearTelefono(usuarioActual.getPhone());

        log.info("📞 Llamando a {} (Intento {}/3) - Zona: {}", 
                usuarioActual.getName(), intento, nombreZona);

        String twiml = String.format(
                "<Response><Say language='es-MX' voice='Polly.Lucia'>" +
                "Alerta de seguridad detectada en zona %s. Repito, alerta en zona %s." +
                "</Say></Response>", nombreZona, nombreZona
        );

        try {
            Call call = Call.creator(
                    new PhoneNumber(telefonoDestino), 
                    new PhoneNumber(twilioNumber), 
                    new Twiml(twiml))
                    .setStatusCallback(serverUrl + "/api/twilio/callback")
                    .setStatusCallbackEvent(java.util.List.of("completed"))
                    .create();

            alertaRepository.updateSidYFechaNotificada(eventoActual.getId(), call.getSid(), LocalDateTime.now());
        } catch (Exception e) {
            log.error("❌ Error al usar Twilio: {}", e.getMessage());
            manejarResultado("failed");
        }
    }

    public synchronized void manejarResultado(String callStatus) {
        log.info("📬 Callback Twilio: {}", callStatus);

        if ("completed".equals(callStatus)) {
            log.info("✅ Llamada atendida exitosamente por {}", usuarioActual.getName());
            alertaRepository.marcarAtendida(eventoActual.getId(), LocalDateTime.now());
            terminarEventoActual();
        } else {
            if (intentos.get() < MAX_INTENTOS) {
                log.info("🔁 Reintentando en 30s (intento {}/3)...", intentos.get() + 1);
                esperarYReintentar();
            } else {
                log.info("❌ El admin {} no respondió tras {} intentos.", usuarioActual.getName(), MAX_INTENTOS);
                colaAdmins.poll(); // Quitar a este admin
                if (colaAdmins.isEmpty()) {
                    log.error("❌ No hay más admins en la cola. Marcando como fallida.");
                    alertaRepository.marcarFallida(eventoActual.getId(), LocalDateTime.now());
                    terminarEventoActual();
                } else {
                    log.info("⏭️  Pasando al siguiente admin: {}", colaAdmins.peek().getName());
                    intentos.set(0);
                    hacerLlamada();
                }
            }
        }
    }

    private void terminarEventoActual() {
        llamadaActiva.set(false);
        inicioLlamadaActual = null;
        procesarSiguienteEnCola();
    }

    @Async
    protected void esperarYReintentar() {
        try {
            Thread.sleep(30000);
            hacerLlamada();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            manejarResultado("failed");
        }
    }

    private String formatearTelefono(String tel) {
        if (tel == null) return "";
        String t = tel.trim().replaceAll("\\s+", "");
        if (t.startsWith("+")) return t;
        if (t.startsWith("57")) return "+" + t;
        return "+57" + t;
    }

    private void cargarColaAdmins() {
        colaAdmins = new LinkedList<>(userRepository.findAllAdminsActivos());
    }

    private void liberarBloqueo() {
        llamadaActiva.set(false);
        eventoActual = null;
        usuarioActual = null;
        intentos.set(0);
        inicioLlamadaActual = null;
        log.info("🔓 Servicio de llamadas liberado y listo.");
    }

    private Alerta construirAlerta(Evento evento) {
        Alerta a = new Alerta();
        a.setEvento(evento);
        a.setCanal("TELEFONO");
        a.setEstadoAlerta("PENDIENTE");
        return a;
    }

    public String obtenerEstado() {
        return String.format("Activa: %s, Pendientes: %d, Intentos: %d", 
                llamadaActiva.get(), colaEventosPendientes.size(), intentos.get());
    }
}
