package backend.security_alert.controller;

import backend.security_alert.sse.SseManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/sse")
@RequiredArgsConstructor
public class SseController {

    private final SseManager sseManager;

    /**
     * Endpoint SSE (Server-Sent Events) para que el frontend se suscriba a eventos en tiempo real.
     *
     * <p>Cómo funciona:
     * <ul>
     *   <li>El cliente hace {@code GET /api/sse/jardin} y deja la conexión HTTP abierta.</li>
     *   <li>El backend registra al cliente en {@link SseManager} (lista en memoria).</li>
     *   <li>Cuando llega un evento (por ejemplo desde MQTT), el backend llama
     *   {@code sseManager.enviarEvento(...)} y el cliente lo recibe al instante.</li>
     * </ul>
     *
     * <p>Nota: SSE es un canal servidor → cliente (no bidireccional).
     */
    @GetMapping(path = "/jardin", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeJardin() {
        return sseManager.createEmitter();
    }
}
