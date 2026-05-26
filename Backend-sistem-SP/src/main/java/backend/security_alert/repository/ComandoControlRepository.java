package backend.security_alert.repository;

import backend.security_alert.models.ComandoControl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComandoControlRepository extends JpaRepository<ComandoControl, Long> {
}
