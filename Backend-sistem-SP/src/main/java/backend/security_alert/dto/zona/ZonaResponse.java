package backend.security_alert.dto.zona;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZonaResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private String ubicacion;
    private String estadoActual;
    private String modoControl;
    private Boolean activa;
    private List<SensorResponse> sensores;
}
