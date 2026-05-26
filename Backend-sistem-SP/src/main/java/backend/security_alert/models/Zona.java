package backend.security_alert.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "zonas")
public class Zona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_zona")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dispositivo", nullable = false)
    private Dispositivo dispositivo;

    private String nombre;
    private String descripcion;
    private String ubicacion;
    private String estadoActual;
    private String modoControl;
    private Boolean activa = true;

    @OneToMany(mappedBy = "zona", fetch = FetchType.LAZY)
    private Set<ProgramacionZona> programaciones = new HashSet<>();

    @OneToMany(mappedBy = "zona")
    private Set<Sensor> sensores = new HashSet<>();

    @OneToMany(mappedBy = "zona")
    private Set<ComandoControl> comandos = new HashSet<>();

    @OneToMany(mappedBy = "zona")
    private Set<Evento> eventos = new HashSet<>();
}
