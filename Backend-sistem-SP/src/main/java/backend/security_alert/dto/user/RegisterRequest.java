package backend.security_alert.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegisterRequest {

    // @NotBlank()
    // @Size(min = 3, max = 25)
    // private String nombre;

    @NotBlank()
    @Size(max = 50)
    @Email()
    private String email;

    @NotBlank()
    @Size(max = 100)
    private String password;
}
