package backend.security_alert.service;

import backend.security_alert.models.Alerta;
import backend.security_alert.models.Evento;
import backend.security_alert.models.User;
import backend.security_alert.repository.AlertaRepository;
import backend.security_alert.repository.UserRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.type.PhoneNumber;
import com.twilio.type.Twiml;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Servicio de alertas por llamada telefónica.
 *
 * Implementa tres mecanismos de control:
 * 1. Bloqueo global (llamadaActiva) - garantiza solo 1 llamada activa
 * 2. Deduplicación por zona (zonasConEventoActivo) - evita duplicados dentro de la misma zona
 * 3. Cola de admins - intenta con múltiples admins en caso de no-answer
 *
 * Ejemplo: Si se activan Puerta Delantera + Pasillo (misma Zona 1) simultáneamente,
 * solo genera UNA llamada. Si Juan (admin 1) no contesta 3 veces, pasa a María (admin 2).
 */
@Service
@RequiredArgsConstructor
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

    // ─── MECANISMO 1: Bloqueo global - solo 1 llamada activa ──────────────────
    private final AtomicBoolean llamadaActiva = new AtomicBoolean(false);
    private final AtomicInteger intentos = new AtomicInteger(0);
    private static final int MAX_INTENTOS = 3;

    // Guarda el evento actual para manejar reintentos
    private Evento eventoActual = null;
    private User usuarioActual = null;

    // ─── MECANISMO 2: Deduplicación por zona ──────────────────────────────────
    // Sincronizado para acceso concurrente desde múltiples threads
    private final Set<Long> zonasConEventoActivo =
            Collections.synchronizedSet(new HashSet<>());

    // ─── NUEVO: Cola real de eventos pendientes ───────────────────────────────
    private final Queue<Evento> colaEventosPendientes = new LinkedList<>();

    // ─── MECANISMO 3: Cola de admins - para reintentos con múltiples admins ────
    // Contiene la lista de admins a intentar, en orden
    private Queue<User> colaAdmins = new LinkedList<>();

    /**
     * Procesa un evento de alerta.
     * 1. Guarda siempre el evento en BD
     * 2. Detecta duplicados por zona (si ya hay una llamada o espera para esa zona)
     * 3. Gestiona la cola de llamadas
     */
    public synchronized void procesarEvento(Evento evento) {
        Long zonaId = evento.getZona().getId();
        Long eventoId = evento.getId();

        System.out.println("📨 Evento recibido - Zona: " + zonaId + " | Evento ID: " + eventoId);

        // 1. SIEMPRE guardar en BD
        Alerta alerta = construirAlerta(evento);
        alertaRepository.save(alerta);
        System.out.println("✅ Alerta guardada en BD - ID: " + alerta.getId());

        // 2. DEDUPLICACIÓN: Si esta zona ya está siendo procesada o espera en cola, ignorar duplicado
        if (zonasConEventoActivo.contains(zonaId)) {
            System.out.println("⚠️  DUPLICADO - Zona " + zonaId + " ya está en el flujo de llamadas. Ignorando.");
            return;
        }

        // 3. Registrar zona y añadir a la cola
        zonasConEventoActivo.add(zonaId);
        colaEventosPendientes.add(evento);
        System.out.println("📋 Evento añadido a la cola. Pendientes: " + colaEventosPendientes.size());

        // 4. Si no hay llamada activa, procesar inmediatamente
        if (!llamadaActiva.get()) {
            procesarSiguienteEnCola();
        } else {
            System.out.println("⏸️  Llamada en curso. El evento esperará su turno.");
        }
    }

    /**
     * Toma el siguiente evento de la cola y arranca el flujo de llamada.
     */
    private synchronized void procesarSiguienteEnCola() {
        if (colaEventosPendientes.isEmpty()) {
            System.out.println("🏁 No hay más eventos pendientes en la cola.");
            liberarBloqueo();
            return;
        }

        eventoActual = colaEventosPendientes.poll();
        System.out.println("🎬 Iniciando flujo de llamada para: " + eventoActual.getZona().getNombre());
        
        intentos.set(0);
        cargarColaAdmins();
        
        if (colaAdmins.isEmpty()) {
            System.err.println("❌ No hay admins disponibles para este evento");
            alertaRepository.marcarFallida(eventoActual.getId(), LocalDateTime.now());
            // Aunque falle, debemos liberar esta zona y seguir con la siguiente
            zonasConEventoActivo.remove(eventoActual.getZona().getId());
            procesarSiguienteEnCola();
            return;
        }

        hacerLlamada();
    }

    /**
     * Ejecuta la llamada vía Twilio con el próximo admin en la cola.
     */
    private void hacerLlamada() {
        llamadaActiva.set(true);
        int intento = intentos.incrementAndGet();
        String nombreZona = eventoActual.getZona().getNombre();

        // Obtener próximo admin en la cola
        if (colaAdmins.isEmpty()) {
            System.err.println("❌ No hay más admins en la cola para " + nombreZona);
            alertaRepository.marcarFallida(eventoActual.getId(), LocalDateTime.now());
            terminarEventoActual();
            return;
        }

        usuarioActual = colaAdmins.peek(); 
        String telefonoAdmin = usuarioActual.getPhone();
        
        // Formatear teléfono
        String telefonoDestino = telefonoAdmin.trim();
        if (!telefonoDestino.startsWith("+")) {
            if (telefonoDestino.startsWith("57")) {
                telefonoDestino = "+" + telefonoDestino;
            } else {
                telefonoDestino = "+57" + telefonoDestino;
            }
        }

        System.out.println("📞 Llamando a " + usuarioActual.getName() + " (Intento " + intento + "/3) - Zona: " + nombreZona);

        String mensaje = String.format(
                "<Response>" +
                "<Say language='es-MX' voice='Polly.Lucia'>" +
                "Alerta de seguridad. Se detectó actividad en la zona %s. " +
                "Ingrese al sistema de inmediato." +
                "</Say>" +
                "<Pause length='1'/>" +
                "<Say language='es-MX' voice='Polly.Lucia'>" +
                "Repitiendo. Alerta en zona %s." +
                "</Say>" +
                "</Response>",
                nombreZona, nombreZona
        );

        try {
            Call call = Call.creator(
                    new PhoneNumber(telefonoDestino),
                    new PhoneNumber(twilioNumber),
                    new Twiml(mensaje)
            )
            .setStatusCallback(serverUrl + "/api/twilio/callback")
            .setStatusCallbackEvent(java.util.List.of("completed"))
            .create();

            alertaRepository.updateSidYFechaNotificada(eventoActual.getId(), call.getSid(), LocalDateTime.now());

        } catch (Exception e) {
            System.err.println("❌ Error Twilio: " + e.getMessage());
            manejarResultado("failed");
        }
    }

    /**
     * Maneja el resultado del callback de Twilio.
     */
    public synchronized void manejarResultado(String callStatus) {
        System.out.println("📬 Resultado llamada: " + callStatus);

        switch (callStatus) {
            case "completed" -> {
                System.out.println("✅ Contestada por " + usuarioActual.getName());
                alertaRepository.marcarAtendida(eventoActual.getId(), LocalDateTime.now());
                terminarEventoActual();
            }
            case "no-answer", "busy", "failed" -> {
                if (intentos.get() < MAX_INTENTOS) {
                    System.out.println("🔁 Reintentando con " + usuarioActual.getName() + "...");
                    esperarYReintentar();
                } else {
                    System.out.println("❌ " + usuarioActual.getName() + " no contestó. Siguiente admin...");
                    colaAdmins.poll();
                    if (colaAdmins.isEmpty()) {
                        alertaRepository.marcarFallida(eventoActual.getId(), LocalDateTime.now());
                        terminarEventoActual();
                    } else {
                        intentos.set(0);
                        hacerLlamada();
                    }
                }
            }
            default -> {
                alertaRepository.marcarFallida(eventoActual.getId(), LocalDateTime.now());
                terminarEventoActual();
            }
        }
    }

    /**
     * Finaliza el procesamiento del evento actual, libera la zona y pasa al siguiente.
     */
    private void terminarEventoActual() {
        if (eventoActual != null) {
            Long zonaId = eventoActual.getZona().getId();
            zonasConEventoActivo.remove(zonaId);
            System.out.println("✨ Zona " + zonaId + " reseteada y lista para nuevos eventos.");
        }
        llamadaActiva.set(false);
        procesarSiguienteEnCola();
    }

    @Async
    protected void esperarYReintentar() {
        try {
            Thread.sleep(30_000);
            hacerLlamada();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            manejarResultado("failed");
        }
    }

    private void cargarColaAdmins() {
        colaAdmins.clear();
        colaAdmins.addAll(userRepository.findAllAdminsActivos());
    }

    private void liberarBloqueo() {
        llamadaActiva.set(false);
        eventoActual = null;
        usuarioActual = null;
        intentos.set(0);
    }

    /**
     * Construye una alerta a partir de un evento.
     */
    private Alerta construirAlerta(Evento evento) {
        Alerta alerta = new Alerta();
        alerta.setEvento(evento);
        alerta.setCanal("TELEFONO");
        alerta.setEstadoAlerta("PENDIENTE");
        alerta.setFechaGenerada(LocalDateTime.now());
        return alerta;
    }

    /**
     * Obtiene el estado actual del servicio.
     */
    public String obtenerEstado() {
        return String.format(
                "Estado CallAlertService:\n" +
                "  Llamada activa: %s\n" +
                "  Intentos: %d/%d\n" +
                "  Zonas con evento activo: %s",
                llamadaActiva.get(), intentos.get(), MAX_INTENTOS, zonasConEventoActivo
        );
    }

    /**
     * Normaliza un número telefónico para Twilio.
     * Maneja diferentes formatos:
     * - "3001234567" → "+573001234567"
     * - "+573001234567" → "+573001234567" (sin duplicar)
     * - "+57 300 1234 567" → "+573001234567" (sin espacios)
     * - "+47 300 1234 567" → "+573001234567" (cambia código de país)
     */
    private String normalizarTelefono(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            throw new IllegalArgumentException("Número telefónico no puede estar vacío");
        }
        
        // Remover espacios, guiones, paréntesis
        phone = phone.replaceAll("[\\s\\-\\(\\)]", "");
        
        // Si ya tiene +57 como código de país, devolverlo tal cual
        if (phone.startsWith("+57")) {
            return phone;
        }
        
        // Si tiene otro +, removerlo y agregar +57
        if (phone.startsWith("+")) {
            phone = phone.substring(1);
        }
        
        // Remover cualquier caracter no numérico
        phone = phone.replaceAll("[^0-9]", "");
        
        // Agregar código de país
        return "+57" + phone;
    }
}
