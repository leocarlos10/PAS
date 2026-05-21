package backend.security_alert.repository;

import backend.security_alert.models.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Long> {

    Optional<Zona> findByNombre(String nombre);
    Optional<Zona> findByNombreIgnoreCase(String nombre);
}
