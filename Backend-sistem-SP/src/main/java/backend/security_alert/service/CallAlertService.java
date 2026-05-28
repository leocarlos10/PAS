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

    // ─── MECANISMO 3: Cola de admins - para reintentos con múltiples admins ────
    // Contiene la lista de admins a intentar, en orden
    private Queue<User> colaAdmins = new LinkedList<>();

    /**
     * Procesa un evento de alerta.
     * 1. Guarda siempre el evento en BD
     * 2. Detecta duplicados por zona
     * 3. Controla que solo haya 1 llamada activa
     * 4. Carga cola de admins para reintentos
     */
    public synchronized void procesarEvento(Evento evento) {
        Long zonaId = evento.getZona().getId();
        Long eventoId = evento.getId();

        System.out.println("📨 Evento recibido - Zona: " + zonaId + " | Evento ID: " + eventoId);

        // 1. SIEMPRE guardar en BD (aunque sea duplicado)
        Alerta alerta = construirAlerta(evento);
        alertaRepository.save(alerta);
        System.out.println("✅ Alerta guardada en BD - ID: " + alerta.getId());

        // 2. Verificar si esta zona ya tiene evento activo (DEDUPLICACIÓN)
        if (zonasConEventoActivo.contains(zonaId)) {
            System.out.println("⚠️  DUPLICADO - Zona " + zonaId +
                    " ya tiene evento activo. Ignorando " + eventoId);
            System.out.println("   Zonas activas: " + zonasConEventoActivo);
            return;
        }

        // 3. Registrar zona como activa
        zonasConEventoActivo.add(zonaId);
        System.out.println("📍 Zona " + zonaId + " registrada como activa");

        // 4. Si ya hay llamada activa → solo dejar registrado
        if (llamadaActiva.get()) {
            System.out.println("⏸️  Llamada ya en curso. Evento " + eventoId +
                    " en cola. Se procesará al terminar la alerta actual.");
            System.out.println("   Zonas activas esperando: " + zonasConEventoActivo);
            return;
        }

        // 5. Sin llamada activa → iniciar ahora
        System.out.println("🎬 Iniciando flujo de llamada para Zona " + zonaId);
        eventoActual = evento;
        intentos.set(0);
        
        // 6. CARGAR COLA DE ADMINS
        cargarColaAdmins();
        
        if (colaAdmins.isEmpty()) {
            System.err.println("❌ No hay admins disponibles en el sistema");
            alertaRepository.marcarFallida(evento.getId(), LocalDateTime.now());
            liberarBloqueo();
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
        Long zonaId = eventoActual.getZona().getId();
        String nombreZona = eventoActual.getZona().getNombre();

        // Obtener próximo admin en la cola
        if (colaAdmins.isEmpty()) {
            System.err.println("❌ No hay más admins en la cola");
            alertaRepository.marcarFallida(eventoActual.getId(), LocalDateTime.now());
            procesarSiguienteZona();
            return;
        }

        usuarioActual = colaAdmins.peek(); // Peek, no poll (queremos reintentar con este)
        String telefonoAdmin = usuarioActual.getPhone();

        System.out.println("📞 Iniciando llamada - Intento " + intento + "/3");
        System.out.println("   Admin: " + usuarioActual.getName() + " (" + telefonoAdmin + ")");
        System.out.println("   Zona: " + nombreZona);
        System.out.println("   Admin ID: " + usuarioActual.getId());

        // Construir mensaje TwiML con instrucciones de voz
        String mensaje = String.format(
                "<Response>" +
                "<Say language='es-MX' voice='Polly.Lucia'>" +
                "Alerta de seguridad. Se detectó actividad en la zona %s. " +
                "Intento número %d de 3. Ingrese al sistema de inmediato." +
                "</Say>" +
                "<Pause length='1'/>" +
                "<Say language='es-MX' voice='Polly.Lucia'>" +
                "Repitiendo. Alerta de seguridad en zona %s." +
                "</Say>" +
                "</Response>",
                nombreZona, intento, nombreZona
        );

        try {
            // Hacer la llamada con Twilio
            Call call = Call.creator(
                    new PhoneNumber("+57" + telefonoAdmin),
                    new PhoneNumber(twilioNumber),
                    new Twiml(mensaje)
            )
            .setStatusCallback(serverUrl + "/api/twilio/callback")
            .setStatusCallbackEvent(java.util.List.of("completed"))
            .create();

            System.out.println("✅ Llamada enviada - SID: " + call.getSid());

            // Guardar SID en BD para trazabilidad
            alertaRepository.updateSidYFechaNotificada(
                    eventoActual.getId(),
                    call.getSid(),
                    LocalDateTime.now()
            );

        } catch (Exception e) {
            System.err.println("❌ Error al realizar la llamada: " + e.getMessage());
            manejarResultado("failed");
        }
    }

    /**
     * Maneja el resultado del callback de Twilio.
     * Se invoca desde el webhook después de que la llamada termina.
     * 
     * Flujo:
     * - Si completada: Marcar atendida y liberar
     * - Si no-answer/busy: Reintentar con MISMO admin (hasta 3)
     * - Si 3 intentos sin respuesta: Pasar al SIGUIENTE admin
     * - Si no hay más admins: Marcar FALLIDA
     */
    public synchronized void manejarResultado(String callStatus) {
        System.out.println("📬 Callback de Twilio: " + callStatus);

        switch (callStatus) {
            case "completed" -> {
                System.out.println("✅ Llamada contestada exitosamente por " + usuarioActual.getName());
                alertaRepository.marcarAtendida(eventoActual.getId(), LocalDateTime.now());
                colaAdmins.clear(); // Limpiar cola ya que tuvo éxito
                procesarSiguienteZona();
            }
            case "no-answer", "busy", "failed" -> {
                if (intentos.get() < MAX_INTENTOS) {
                    // Reintentar con MISMO admin
                    System.out.println("🔁 Sin respuesta. Reintentando en 30s con " + 
                            usuarioActual.getName() + "... (intento " + intentos.get() + "/" + MAX_INTENTOS + ")");
                    esperarYReintentar();
                } else {
                    // Ya intentamos 3 veces con este admin
                    System.out.println("❌ Tras 3 intentos, " + usuarioActual.getName() + 
                            " no contestó. Pasando al siguiente admin...");
                    
                    // Quitar admin actual de la cola
                    colaAdmins.poll();
                    
                    if (colaAdmins.isEmpty()) {
                        // No hay más admins
                        System.out.println("❌ No hay más admins disponibles. Marcando alerta como FALLIDA.");
                        alertaRepository.marcarFallida(eventoActual.getId(), LocalDateTime.now());
                        procesarSiguienteZona();
                    } else {
                        // Hay más admins, reintentar con el siguiente
                        System.out.println("📞 Intentando con el siguiente admin: " + colaAdmins.peek().getName());
                        intentos.set(0); // Reset contador de intentos para el nuevo admin
                        hacerLlamada();
                    }
                }
            }
            default -> {
                System.out.println("⚠️  Estado desconocido: " + callStatus);
                alertaRepository.marcarFallida(eventoActual.getId(), LocalDateTime.now());
                procesarSiguienteZona();
            }
        }
    }

    /**
     * Espera 30 segundos y reintenta la llamada.
     */
    @Async
    protected void esperarYReintentar() {
        try {
            System.out.println("⏰ Esperando 30 segundos antes del reintento...");
            Thread.sleep(30_000); // 30 segundos
            hacerLlamada();
        } catch (InterruptedException e) {
            System.err.println("❌ Reintento interrumpido: " + e.getMessage());
            Thread.currentThread().interrupt();
            manejarResultado("failed");
        }
    }

    /**
     * Procesa la siguiente zona en la cola.
     * Libera la zona actual y busca la siguiente con evento activo.
     */
    private void procesarSiguienteZona() {
        Long zonaActualId = eventoActual.getZona().getId();

        // Liberar zona actual
        zonasConEventoActivo.remove(zonaActualId);
        System.out.println("✨ Zona " + zonaActualId + " liberada");
        System.out.println("   Zonas activas aún pendientes: " + zonasConEventoActivo);

        liberarBloqueo();

        // Si hay otras zonas esperando, procesar la siguiente
        if (!zonasConEventoActivo.isEmpty()) {
            System.out.println("📋 Procesando siguiente zona en cola...");
            // Aquí en una implementación real se buscaría el siguiente evento
            // Por ahora, el siguiente evento llegará vía MQTT y ejecutará procesarEvento()
        }
    }

    /**
     * Carga la cola de admins activos ordenados por ID.
     * Si hay 2 admins, intenta primero el primero, luego el segundo.
     */
    private void cargarColaAdmins() {
        colaAdmins.clear();
        List<User> adminsActivos = userRepository.findAllAdminsActivos();
        
        if (adminsActivos.isEmpty()) {
            System.err.println("❌ No hay admins activos en el sistema");
            return;
        }
        
        colaAdmins.addAll(adminsActivos);
        System.out.println("📋 Cola de admins cargada (" + adminsActivos.size() + " disponibles):");
        for (User admin : adminsActivos) {
            System.out.println("   - " + admin.getName() + " (" + admin.getPhone() + ")");
        }
    }

    /**
     * Libera el bloqueo global y limpia variables.
     */
    private void liberarBloqueo() {
        llamadaActiva.set(false);
        eventoActual = null;
        usuarioActual = null;
        intentos.set(0);
        colaAdmins.clear();
        System.out.println("🔓 Bloqueo global liberado");
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
}
