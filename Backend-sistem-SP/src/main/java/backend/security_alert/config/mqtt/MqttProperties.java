package backend.security_alert.config.mqtt;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mqtt")
public record MqttProperties(
        String brokerUrl,
        String clientId,
        String topicFilter,
        String username,
        String password
) {
}
