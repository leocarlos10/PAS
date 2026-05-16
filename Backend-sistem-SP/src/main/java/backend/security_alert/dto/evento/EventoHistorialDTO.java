package backend.security_alert.dto.evento;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventoHistorialDTO {

    private Long idEvento;
    private LocalDateTime fechaHora;
    private String zonaNombre;
    private String sensorCodigo;
    private String sensorNombre;
    private String tipoEvento;
    private String descripcion;
    private String severidad;
}
