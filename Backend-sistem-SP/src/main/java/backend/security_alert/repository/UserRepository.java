package backend.security_alert.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import backend.security_alert.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    /**
     * Busca un admin/administrador activo para recibir alertas.
     * Retorna solo el primero (para compatibilidad hacia atrás).
     */
    @Query("SELECT u FROM User u WHERE u.user_rol = 'ADMIN' AND u.active = true LIMIT 1")
    Optional<User> findAdminDeTurno();

    /**
     * Busca TODOS los admins activos, ordenados por ID.
     * Para implementar cola de múltiples admins.
     */
    @Query("SELECT u FROM User u WHERE u.user_rol = 'ADMIN' AND u.active = true ORDER BY u.id ASC")
    List<User> findAllAdminsActivos();
}

