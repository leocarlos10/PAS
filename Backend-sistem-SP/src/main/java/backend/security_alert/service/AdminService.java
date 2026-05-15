package backend.security_alert.service;

import backend.security_alert.dto.user.AdminUserResponse;
import backend.security_alert.dto.user.UpdateUserRequest;
import backend.security_alert.exception.BadRequestCustomException;
import backend.security_alert.exception.DataExistException;
import backend.security_alert.exception.NotFoundException;
import backend.security_alert.models.User;
import backend.security_alert.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminUserResponse> listAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::toAdminUserResponse)
                .toList();
    }

    public AdminUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        return toAdminUserResponse(user);
    }

    @Transactional
    public AdminUserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            boolean usernameTaken = userRepository.findByUsername(request.getUsername())
                    .filter(u -> !u.getId().equals(id))
                    .isPresent();
            if (usernameTaken) {
                throw new DataExistException("Username already in use");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        userRepository.save(user);
        return toAdminUserResponse(user);
    }

    @Transactional
    public AdminUserResponse toggleUserActive(Long id, Boolean active) {
        if (active == null) {
            throw new BadRequestCustomException("The 'active' field is required");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        user.setActive(active);
        userRepository.save(user);
        return toAdminUserResponse(user);
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .phone(user.getPhone())
                .role(user.getUser_rol() != null ? user.getUser_rol().name() : null)
                .active(user.getActive())
                .build();
    }
}
