package backend.security_alert.repository;

import backend.security_alert.models.Zona;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Long> {

    Optional<Zona> findByNombre(String nombre);
    Optional<Zona> findByNombreIgnoreCase(String nombre);

    @EntityGraph(attributePaths = {"dispositivo", "programacion", "sensores"})
    @Query("SELECT z FROM Zona z")
    List<Zona> findAllWithRelations();

    @EntityGraph(attributePaths = {"dispositivo", "programacion", "sensores"})
    @Query("SELECT z FROM Zona z WHERE z.id = :id")
    Optional<Zona> findByIdWithRelations(@Param("id") Long id);

    @EntityGraph(attributePaths = {"dispositivo", "programacion", "sensores"})
    List<Zona> findAllByDispositivoId(Long dispositivoId);

    @EntityGraph(attributePaths = {"dispositivo", "programacion", "sensores"})
    List<Zona> findAllByActiva(Boolean activa);

    @EntityGraph(attributePaths = {"dispositivo", "programacion", "sensores"})
    List<Zona> findAllByDispositivoIdAndActiva(Long dispositivoId, Boolean activa);
}
