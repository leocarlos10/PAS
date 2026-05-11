package backend.security_alert.controller;

import backend.security_alert.dto.common.Response;
import backend.security_alert.dto.user.AdminUserResponse;
import backend.security_alert.dto.user.UpdateUserRequest;
import backend.security_alert.service.AdminService;
import backend.security_alert.dto.user.UpdateUserStatusRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<Response<List<AdminUserResponse>>> listAllUsers() {
        List<AdminUserResponse> users = adminService.listAllUsers();

        Response<List<AdminUserResponse>> response = Response.<List<AdminUserResponse>>builder()
                .responseCode(HttpStatus.OK.value())
                .responseMessage("SUCCESS")
                .data(users)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response<AdminUserResponse>> getUserById(@PathVariable Long id) {
        AdminUserResponse user = adminService.getUserById(id);

        Response<AdminUserResponse> response = Response.<AdminUserResponse>builder()
                .responseCode(HttpStatus.OK.value())
                .responseMessage("SUCCESS")
                .data(user)
                .build();

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Response<AdminUserResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {
        AdminUserResponse user = adminService.updateUser(id, request);

        Response<AdminUserResponse> response = Response.<AdminUserResponse>builder()
                .responseCode(HttpStatus.OK.value())
                .responseMessage("SUCCESS")
                .data(user)
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Response<AdminUserResponse>> toggleUserActive(
            @PathVariable Long id,
            @RequestBody UpdateUserStatusRequest request) {
        AdminUserResponse user = adminService.toggleUserActive(id, request.getActive());

        Response<AdminUserResponse> response = Response.<AdminUserResponse>builder()
                .responseCode(HttpStatus.OK.value())
                .responseMessage("SUCCESS")
                .data(user)
                .build();

        return ResponseEntity.ok(response);
    }
}
