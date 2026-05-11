package backend.security_alert.controller;

import backend.security_alert.dto.common.Response;
import backend.security_alert.dto.user.LoginRequest;
import backend.security_alert.dto.user.RegisterRequest;
import backend.security_alert.dto.user.RegisterResponse;
import backend.security_alert.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class UserController {

    UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request, null));
    }

    @PostMapping("/register")
    public ResponseEntity<Response<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        
        RegisterResponse registerData = userService.register(request);

        Response<RegisterResponse> responseBody = Response.<RegisterResponse>builder()
                .responseCode(HttpStatus.CREATED.value())
                .responseMessage("SUCCESS")
                .data(registerData)
                .build();

        return new ResponseEntity<>(responseBody, HttpStatus.CREATED);
    }
}
