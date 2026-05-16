package backend.security_alert.dto.user;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegisterResponse {

    @Size(max = 100)
    private String username;

    @Size(max = 100)
    private String name;

    @Size(max = 30)
    private String phone;
}
