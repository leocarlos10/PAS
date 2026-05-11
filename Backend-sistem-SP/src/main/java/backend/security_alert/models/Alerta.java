package backend.security_alert.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "alertas")
public class Alerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alerta")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evento", nullable = false)
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_destino")
    private User usuarioDestino;

    private String canal;
    private String telefonoDestino;
    private String estadoAlerta;
    private LocalDateTime fechaGenerada;
    private LocalDateTime fechaNotificada;

    @PrePersist
    public void prePersist() {
        this.fechaGenerada = LocalDateTime.now();
    }
}
