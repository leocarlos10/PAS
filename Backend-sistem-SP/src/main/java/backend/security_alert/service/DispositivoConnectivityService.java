package backend.security_alert.service;

import backend.security_alert.models.Dispositivo;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class DispositivoConnectivityService {

    private static final Duration TIMEOUT = Duration.ofMinutes(10);

    public boolean isConectado(Dispositivo dispositivo) {
        if (dispositivo == null) {
            return false;
        }
        if (dispositivo.getEstadoConexion() == null
                || !"CONECTADO".equalsIgnoreCase(dispositivo.getEstadoConexion().trim())) {
            return false;
        }
        LocalDateTime ultimaConexion = dispositivo.getUltimaConexion();
        if (ultimaConexion == null) {
            return false;
        }
        return ultimaConexion.isAfter(LocalDateTime.now().minus(TIMEOUT));
    }
}
