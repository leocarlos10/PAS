package backend.security_alert.dto.evento;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventoRequestDTO {

    private Long idZona;
    private Long idSensor;
    private Long idComando;
    private String tipoEvento;
    private String descripcion;
    private String valorSensor;
}
