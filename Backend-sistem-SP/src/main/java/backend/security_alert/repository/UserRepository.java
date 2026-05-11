package backend.security_alert.repository;

import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import backend.security_alert.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByGmail(String gmail);
    boolean existsByGmail(String gmail); 
}
