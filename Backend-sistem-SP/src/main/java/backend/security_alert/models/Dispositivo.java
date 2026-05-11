package backend.security_alert.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "dispositivos")
public class Dispositivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dispositivo")
    private Long id;

    private String nombre;
    private String tipo;
    private String mac;
    private String ipLocal;

    @Column(name = "broquer_mqtt")
    private String brokerMqtt;

    private String topicEstado;
    private String topicComando;
    private String estadoConexion;

    private LocalDateTime ultimaConexion;

    @OneToMany(mappedBy = "dispositivo")
    private Set<Zona> zonas = new HashSet<>();
}
