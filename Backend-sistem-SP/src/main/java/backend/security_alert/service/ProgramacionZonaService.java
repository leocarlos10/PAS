package backend.security_alert.service;

import backend.security_alert.dto.zona.ProgramacionHorariaRequest;
import backend.security_alert.exception.BadRequestCustomException;
import backend.security_alert.exception.NotFoundException;
import backend.security_alert.models.ProgramacionZona;
import backend.security_alert.models.Zona;
import backend.security_alert.repository.ProgramacionZonaRepository;
import backend.security_alert.repository.ZonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProgramacionZonaService {

    private static final Set<String> DIAS_VALIDOS = Set.of(
            "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo", "todos"
    );

    private final ProgramacionZonaRepository programacionZonaRepository;
    private final ZonaRepository zonaRepository;

    @Transactional(readOnly = true)
    public Optional<ProgramacionZona> obtenerPorZona(Long zonaId) {
        return programacionZonaRepository.findByZonaId(zonaId);
    }

    @Transactional
    public ProgramacionZona guardarProgramacion(Long zonaId, ProgramacionHorariaRequest request) {
        validarHorarios(request);

        Zona zona = zonaRepository.findByIdWithRelations(zonaId)
                .orElseThrow(() -> new NotFoundException("Zona no encontrada: " + zonaId));

        ProgramacionZona programacion = programacionZonaRepository.findByZonaId(zonaId)
                .orElseGet(() -> {
                    ProgramacionZona nueva = new ProgramacionZona();
                    nueva.setZona(zona);
                    return nueva;
                });

        programacion.setHoraInicio(request.horaInicio());
        programacion.setHoraFin(request.horaFin());
        programacion.setDiasSemana(normalizarDiasSemana(request.diasSemana()));
        programacion.setActiva(request.activa());
        programacion.setUltimoArmadoEjecutado(null);
        programacion.setUltimoDesarmadoEjecutado(null);

        zona.setProgramacion(programacion);
        zona.setModoControl(Boolean.TRUE.equals(request.activa()) ? "AUTOMATICO" : "MANUAL");

        zonaRepository.save(zona);
        return programacionZonaRepository.save(programacion);
    }

    private void validarHorarios(ProgramacionHorariaRequest request) {
        if (request.horaInicio().equals(request.horaFin())) {
            throw new BadRequestCustomException("La hora de armado y desarmado no pueden ser iguales");
        }
    }

    private List<String> normalizarDiasSemana(List<String> diasSemana) {
        List<String> normalizados = diasSemana.stream()
                .map(dia -> dia.trim().toLowerCase(Locale.ROOT))
                .distinct()
                .toList();

        boolean invalido = normalizados.stream().anyMatch(dia -> !DIAS_VALIDOS.contains(dia));
        if (invalido) {
            throw new BadRequestCustomException("diasSemana contiene valores no válidos");
        }

        if (normalizados.contains("todos")) {
            return List.of("todos");
        }

        return normalizados;
    }
}
