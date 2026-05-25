package backend.security_alert.service.mqtt;

import backend.security_alert.config.mqtt.MqttProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MqttCommandService {

    private final MqttProperties mqttProperties;
    private final ObjectMapper objectMapper;

    private volatile MqttClient client;

    public boolean publicarComando(String topicComando, String accion) {
        if (topicComando == null || topicComando.isBlank()) {
            log.warn("No se publicó comando MQTT: topicComando vacío. accion={}", accion);
            return false;
        }
        ComandoPayload payload = new ComandoPayload(accion);
        try {
            ensureConnected();
            byte[] bytes = objectMapper.writeValueAsBytes(payload);
            MqttMessage message = new MqttMessage(bytes);
            message.setQos(1);
            client.publish(topicComando, message);
            log.info("MQTT comando publicado. topic='{}' payload='{}'", topicComando, new String(bytes, StandardCharsets.UTF_8));
            return true;
        } catch (Exception e) {
            log.error("Error publicando comando MQTT. topic='{}' accion={}", topicComando, accion, e);
            return false;
        }
    }

    private void ensureConnected() throws MqttException {
        if (client != null && client.isConnected()) return;
        synchronized (this) {
            if (client != null && client.isConnected()) return;

            String clientId = (mqttProperties.clientId() == null || mqttProperties.clientId().isBlank())
                    ? "security-alert-cmd-" + UUID.randomUUID()
                    : mqttProperties.clientId() + "-cmd-" + UUID.randomUUID();

            MqttClient newClient = new MqttClient(mqttProperties.brokerUrl(), clientId, new MemoryPersistence());
            MqttConnectOptions options = new MqttConnectOptions();
            options.setAutomaticReconnect(true);
            options.setCleanSession(true);
            if (mqttProperties.username() != null && !mqttProperties.username().isBlank()) {
                options.setUserName(mqttProperties.username());
            }
            if (mqttProperties.password() != null && !mqttProperties.password().isBlank()) {
                options.setPassword(mqttProperties.password().toCharArray());
            }
            newClient.connect(options);
            client = newClient;
            log.info("MQTT publisher conectado. brokerUrl='{}' clientId='{}'", mqttProperties.brokerUrl(), clientId);
        }
    }

    @PreDestroy
    public void stop() {
        try {
            if (client != null && client.isConnected()) client.disconnect();
        } catch (Exception ignored) {
        }
    }

    public record ComandoPayload(String accion) {
    }
}
