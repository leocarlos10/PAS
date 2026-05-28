package backend.security_alert.config;

import com.twilio.Twilio;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de Twilio.
 * Inicializa el cliente de Twilio con las credenciales del archivo de propiedades.
 */
@Configuration
public class TwilioConfig {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @PostConstruct
    public void initTwilio() {
        Twilio.init(accountSid, authToken);
        System.out.println("✅ Twilio inicializado correctamente con SID: " +
                accountSid.substring(0, Math.min(8, accountSid.length())) + "...");
    }
}
