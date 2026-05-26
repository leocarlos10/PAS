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
    public List<ProgramacionZona> listarPorZona(Long zonaId) {
        verificarZonaExiste(zonaId);
        return programacionZonaRepository.findAllByZona_Id(zonaId);
    }

    @Transactional
    public ProgramacionZona crear(Long zonaId, ProgramacionHorariaRequest request) {
        Zona zona = zonaRepository.findByIdWithRelations(zonaId)
                .orElseThrow(() -> new NotFoundException("Zona no encontrada: " + zonaId));

        ProgramacionZona programacion = new ProgramacionZona();
        programacion.setZona(zona);
        aplicarDatos(programacion, request);

        ProgramacionZona guardada = programacionZonaRepository.save(programacion);
        sincronizarModoControl(zona.getId());
        return guardada;
    }

    @Transactional
    public ProgramacionZona actualizar(Long zonaId, Long programacionId, ProgramacionHorariaRequest request) {
        ProgramacionZona programacion = obtenerProgramacionDeZona(zonaId, programacionId);
        aplicarDatos(programacion, request);

        ProgramacionZona guardada = programacionZonaRepository.save(programacion);
        sincronizarModoControl(zonaId);
        return guardada;
    }

    @Transactional
    public void eliminar(Long zonaId, Long programacionId) {
        ProgramacionZona programacion = obtenerProgramacionDeZona(zonaId, programacionId);
        programacionZonaRepository.delete(programacion);
        sincronizarModoControl(zonaId);
    }

    private ProgramacionZona obtenerProgramacionDeZona(Long zonaId, Long programacionId) {
        return programacionZonaRepository.findByIdAndZona_Id(programacionId, zonaId)
                .orElseThrow(() -> new NotFoundException(
                        "Programación no encontrada: " + programacionId + " para zona " + zonaId));
    }

    private void verificarZonaExiste(Long zonaId) {
        if (!zonaRepository.existsById(zonaId)) {
            throw new NotFoundException("Zona no encontrada: " + zonaId);
        }
    }

    private void aplicarDatos(ProgramacionZona programacion, ProgramacionHorariaRequest request) {
        validarHorarios(request);
        programacion.setHoraInicio(request.horaInicio());
        programacion.setHoraFin(request.horaFin());
        programacion.setDiasSemana(normalizarDiasSemana(request.diasSemana()));
        programacion.setActiva(request.activa());
        programacion.setUltimoArmadoEjecutado(null);
        programacion.setUltimoDesarmadoEjecutado(null);
    }

    private void sincronizarModoControl(Long zonaId) {
        Zona zona = zonaRepository.findById(zonaId)
                .orElseThrow(() -> new NotFoundException("Zona no encontrada: " + zonaId));

        boolean algunaActiva = programacionZonaRepository.findAllByZona_Id(zonaId).stream()
                .anyMatch(p -> Boolean.TRUE.equals(p.getActiva()));

        zona.setModoControl(algunaActiva ? "AUTOMATICO" : "MANUAL");
        zonaRepository.save(zona);
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
