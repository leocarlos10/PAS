package backend.security_alert.models;

import backend.security_alert.models.converter.DiasSemanaConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "programaciones_zona")
public class ProgramacionZona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_programacion")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_zona", nullable = false)
    private Zona zona;

    @Convert(converter = DiasSemanaConverter.class)
    @Column(name = "dias_semana", nullable = false)
    private List<String> diasSemana = new ArrayList<>();

    private String horaInicio;
    private String horaFin;
    private Boolean activa = true;

    @Column(name = "ultimo_armado_ejecutado")
    private LocalDate ultimoArmadoEjecutado;

    @Column(name = "ultimo_desarmado_ejecutado")
    private LocalDate ultimoDesarmadoEjecutado;
}
