package backend.security_alert.dto.zona;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record ProgramacionHorariaRequest(
        @NotBlank(message = "horaInicio es requerida")
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "horaInicio debe tener formato HH:mm")
        String horaInicio,

        @NotBlank(message = "horaFin es requerida")
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "horaFin debe tener formato HH:mm")
        String horaFin,

        @NotEmpty(message = "diasSemana debe incluir al menos un día")
        List<@NotBlank String> diasSemana,

        @NotNull(message = "activa es requerida")
        Boolean activa
) {
}
