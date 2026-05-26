package backend.security_alert.dto.dispositivo;

import java.util.List;

public record WifiConfigBatchResponse(
        String mensaje,
        int enviados,
        int omitidos,
        List<Long> dispositivos
) {
}
