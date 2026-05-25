package backend.security_alert.repository;

import backend.security_alert.models.ProgramacionZona;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramacionZonaRepository extends JpaRepository<ProgramacionZona, Long> {

    List<ProgramacionZona> findAllByZona_Id(Long zonaId);

    Optional<ProgramacionZona> findByIdAndZona_Id(Long id, Long zonaId);

    @EntityGraph(attributePaths = {"zona", "zona.dispositivo"})
    List<ProgramacionZona> findAllByActivaTrue();
}
