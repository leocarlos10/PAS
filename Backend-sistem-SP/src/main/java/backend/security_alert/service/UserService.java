package backend.security_alert.service;

import backend.security_alert.config.jwt.JwtUtils;
import backend.security_alert.config.services.UserDetailsImpl; 
import backend.security_alert.dto.common.Response;
import backend.security_alert.dto.user.LoginRequest;
import backend.security_alert.dto.user.LoginResponse;
import backend.security_alert.dto.user.RegisterRequest;
import backend.security_alert.dto.user.RegisterResponse;
import backend.security_alert.exception.DataExistException;
import backend.security_alert.exception.NotFoundException;
import backend.security_alert.models.User;
import backend.security_alert.models.enums.UserRol;
import backend.security_alert.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    public UserService(
        UserRepository userRepository,
        PasswordEncoder encoder,
        AuthenticationManager authenticationManager,
        JwtUtils jwtUtils
    ) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    UserRepository userRepository;
    PasswordEncoder encoder;
    AuthenticationManager authenticationManager;
    JwtUtils jwtUtils;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DataExistException("Username already registered");
        }

        String hashedPassword = encoder.encode(request.getPassword());

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(hashedPassword);
        user.setUser_rol(UserRol.USUARIO);
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setActive(false);

        try {
            userRepository.save(user);

        } catch (Exception e) {
            throw new RuntimeException(
                "Error al guardar usuario: " + e.getMessage()
            );
        }

        RegisterResponse registerUserResponse = RegisterResponse.builder()
            .username(user.getUsername())
            .name(user.getName())
            .phone(user.getPhone())
            .build();

        return registerUserResponse;
    }

    @Transactional
    public Response<Object> login(
        LoginRequest request,
        HttpServletResponse response
    ) {
        userRepository.findByUsername(request.getUsername())
            .orElseThrow(() ->
                new NotFoundException("User not found. Please register first")
            );

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String jwt = jwtUtils.generateJwtToken(userDetails);

        List<String> roles = userDetails
            .getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .toList();

        LoginResponse loginResponse = LoginResponse.builder()
            .username(userDetails.getUsername())
            .roles(roles)
            .accessToken(jwt)
            .tokenType("Bearer")
            .build();

        return Response.builder()
            .responseCode(200)
            .responseMessage("SUCCESS")
            .data(loginResponse)
            .build();
    }

}


