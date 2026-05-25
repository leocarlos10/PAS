package backend.security_alert;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class SecurityAlertApplication {

	public static void main(String[] args) {
		SpringApplication.run(SecurityAlertApplication.class, args);
	}
}