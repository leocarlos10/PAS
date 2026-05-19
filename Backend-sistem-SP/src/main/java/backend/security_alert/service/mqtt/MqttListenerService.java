package backend.security_alert.service.mqtt;

import backend.security_alert.config.mqtt.MqttProperties;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
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
public class MqttListenerService implements MqttCallback {

    private final MqttProperties mqttProperties;
    private final MqttDataService mqttDataService;

    private MqttClient client;

    @PostConstruct
    public void start() throws MqttException {
        String clientId = (mqttProperties.clientId() == null || mqttProperties.clientId().isBlank())
                ? "security-alert-" + UUID.randomUUID()
                : mqttProperties.clientId();

        client = new MqttClient(mqttProperties.brokerUrl(), clientId, new MemoryPersistence());
        client.setCallback(this);

        MqttConnectOptions options = new MqttConnectOptions();
        options.setAutomaticReconnect(true);
        options.setCleanSession(true);
        if (mqttProperties.username() != null && !mqttProperties.username().isBlank()) {
            options.setUserName(mqttProperties.username());
        }
        if (mqttProperties.password() != null && !mqttProperties.password().isBlank()) {
            options.setPassword(mqttProperties.password().toCharArray());
        }

        client.connect(options);
        String filter = mqttProperties.topicFilter();
        client.subscribe(filter);
        log.info("MQTT conectado. brokerUrl='{}' clientId='{}' topicFilter='{}'",
                mqttProperties.brokerUrl(), clientId, filter);
    }

    @PreDestroy
    public void stop() {
        try {
            if (client != null && client.isConnected()) {
                client.disconnect();
            }
        } catch (Exception ignored) {
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        // reconexión automática activada
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        String payload = new String(message.getPayload(), StandardCharsets.UTF_8);
        log.info("MQTT recibido. topic='{}' payload='{}'", topic, payload);
        mqttDataService.procesarMensaje(topic, payload);
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // no-op (solo suscriptor)
    }
}
