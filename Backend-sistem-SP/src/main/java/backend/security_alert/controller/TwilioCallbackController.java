package backend.security_alert.controller;

import backend.security_alert.service.CallAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Webhook que recibe callbacks de Twilio cuando las llamadas terminan.
 *
 * Twilio hace un POST automáticamente a este endpoint cuando:
 * - La llamada es contestada
 * - La llamada no es contestada
 * - La llamada falla
 * - El destinatario cuelga
 */
@RestController
@RequestMapping("/api/twilio")
@RequiredArgsConstructor
public class TwilioCallbackController {

    private final CallAlertService callAlertService;

    /**
     * Recibe el callback de Twilio cuando una llamada termina.
     *
     * @param callStatus Estado final de la llamada (completed, no-answer, busy, failed)
     * @param callSid ID único de la llamada (para trazabilidad)
     * @return Respuesta TwiML vacía (Twilio solo necesita un 200 OK)
     */
    @PostMapping("/callback")
    public ResponseEntity<String> callback(
            @RequestParam(name = "CallStatus") String callStatus,
            @RequestParam(name = "CallSid") String callSid) {

        System.out.println("📍 Webhook Twilio - CallStatus: " + callStatus + " | SID: " + callSid);

        // Procesar el resultado
        callAlertService.manejarResultado(callStatus);

        // Twilio requiere una respuesta XML válida (puede estar vacía)
        return ResponseEntity.ok("<Response></Response>");
    }

    /**
     * Endpoint para verificar el estado del servicio de llamadas.
     */
    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok(callAlertService.obtenerEstado());
    }
}
