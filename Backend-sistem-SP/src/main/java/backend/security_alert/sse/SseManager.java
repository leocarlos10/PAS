package backend.security_alert.sse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class SseManager {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        // Enviar evento inicial para forzar flush y disparar onopen en clientes/proxies
        try {
            emitter.send(SseEmitter.event().name("init").data("connected"));
        } catch (IOException ignored) {
        }

        // Heartbeat periódico para mantener viva la conexión y evitar buffering en
        // proxies
        ScheduledExecutorService heartbeat = Executors.newSingleThreadScheduledExecutor();
        heartbeat.scheduleAtFixedRate(() -> {
            try {
                emitter.send(SseEmitter.event().comment("heartbeat"));
            } catch (Exception e) {
                try {
                    emitter.completeWithError(e);
                } catch (Exception ignored) {
                }
                emitters.remove(emitter);
                heartbeat.shutdown();
            }
        }, 15, 15, TimeUnit.SECONDS); // cada 15s, ajustar si es necesario

        // Apagar scheduler cuando la conexión se cierre
        emitter.onCompletion(() -> heartbeat.shutdown());
        emitter.onTimeout(() -> heartbeat.shutdown());
        emitter.onError(e -> heartbeat.shutdown());

        return emitter;
    }

    public void enviarEvento(String eventName, Object data) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                emitter.completeWithError(e);
                emitters.remove(emitter);
            }
        }
    }
}

