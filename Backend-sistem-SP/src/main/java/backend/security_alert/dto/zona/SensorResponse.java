package backend.security_alert.dto.zona;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorResponse {

    private Long id;
    private String codigo;
    private String tipoSensor;
    private String ubicacionDetalle;
    private String estadoActual;
    private LocalDateTime ultimoReporte;
    private Boolean activo;
}
