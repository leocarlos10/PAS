package backend.security_alert.service;

import backend.security_alert.config.jwt.JwtUtils;
import backend.security_alert.config.services.UserDetailsImpl; 
import backend.security_alert.dto.common.Response;
import backend.security_alert.dto.user.LoginRequest;
import backend.security_alert.dto.user.LoginResponse;
import backend.security_alert.dto.user.RegisterRequest;
import backend.security_alert.dto.user.RegisterResponse;
import backend.security_alert.models.User;
import backend.security_alert.models.enums.UserRol;
import backend.security_alert.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
        if (userRepository.existsByGmail(request.getEmail())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Email already registered"
            );
        }

        String hashedPassword = encoder.encode(request.getPassword());

        User user = new User();
        user.setGmail(request.getEmail());
        user.setPassword(hashedPassword);
        user.setUser_rol(UserRol.USUARIO);

        try {
            userRepository.save(user);

        } catch (Exception e) {
            throw new RuntimeException(
                "Error al guardar usuario: " + e.getMessage()
            );
        }

        RegisterResponse registerUserResponse = RegisterResponse.builder()
            .name(user.getGmail())
            .email(user.getGmail())
            .build();

        return registerUserResponse;
    }

    @Transactional
    public Response<Object> login(
        LoginRequest request,
        HttpServletResponse response
    ) {
        userRepository.findByGmail(request.getEmail())
            .orElseThrow(() ->
                new RuntimeException("User not found. Please register first")
            );

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
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
            .email(userDetails.getUsername())
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




