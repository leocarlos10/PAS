package backend.security_alert.dto.zona;

import backend.security_alert.models.ProgramacionZona;

import java.util.List;

public record ProgramacionHorariaResponse(
        Long id,
        Long zonaId,
        String horaInicio,
        String horaFin,
        List<String> diasSemana,
        Boolean activa
) {
    public static ProgramacionHorariaResponse from(ProgramacionZona programacion) {
        return new ProgramacionHorariaResponse(
                programacion.getId(),
                programacion.getZona() != null ? programacion.getZona().getId() : null,
                programacion.getHoraInicio(),
                programacion.getHoraFin(),
                programacion.getDiasSemana(),
                programacion.getActiva()
        );
    }
}
