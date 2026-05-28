package backend.security_alert.repository;

import backend.security_alert.models.Alerta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface AlertaRepository extends JpaRepository<Alerta, Long> {

    /**
     * Actualiza el SID de la llamada de Twilio y la fecha de notificación.
     */
    @Modifying
    @Transactional
    @Query("UPDATE Alerta a SET a.telefonoDestino = :sid, a.fechaNotificada = :fechaNotificada " +
           "WHERE a.evento.id = :eventoId")
    void updateSidYFechaNotificada(
            @Param("eventoId") Long eventoId,
            @Param("sid") String sid,
            @Param("fechaNotificada") LocalDateTime fechaNotificada
    );

    /**
     * Marca una alerta como atendida.
     */
    @Modifying
    @Transactional
    @Query("UPDATE Alerta a SET a.estadoAlerta = 'ATENDIDA', a.fechaNotificada = :fechaNotificada " +
           "WHERE a.evento.id = :eventoId")
    void marcarAtendida(
            @Param("eventoId") Long eventoId,
            @Param("fechaNotificada") LocalDateTime fechaNotificada
    );

    /**
     * Marca una alerta como fallida.
     */
    @Modifying
    @Transactional
    @Query("UPDATE Alerta a SET a.estadoAlerta = 'FALLIDA', a.fechaNotificada = :fechaNotificada " +
           "WHERE a.evento.id = :eventoId")
    void marcarFallida(
            @Param("eventoId") Long eventoId,
            @Param("fechaNotificada") LocalDateTime fechaNotificada
    );
}
