package backend.security_alert.service;

import backend.security_alert.models.Zona;

public record ZonaComandoResult(
        Zona zona,
        boolean dispositivoConectado,
        boolean comandoEnviadoBroker,
        String advertencia
) {
}
