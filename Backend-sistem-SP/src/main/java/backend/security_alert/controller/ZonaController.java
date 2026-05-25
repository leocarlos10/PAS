package backend.security_alert.controller;

import backend.security_alert.config.services.UserDetailsImpl;
import backend.security_alert.dto.zona.ProgramacionHorariaRequest;
import backend.security_alert.dto.zona.ProgramacionHorariaResponse;
import backend.security_alert.dto.zona.SensorResponse;
import backend.security_alert.models.ProgramacionZona;
import backend.security_alert.models.Sensor;
import backend.security_alert.models.User;
import backend.security_alert.models.Zona;
import backend.security_alert.repository.UserRepository;
import backend.security_alert.service.ProgramacionZonaService;
import backend.security_alert.service.ZonaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/zonas")
@RequiredArgsConstructor
public class ZonaController {

    private final ZonaService zonaService;
    private final ProgramacionZonaService programacionZonaService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ZonaResponse>> listar(
            @RequestParam(required = false) Long dispositivoId,
            @RequestParam(required = false) Boolean activa) {

        List<ZonaResponse> zonas = zonaService
                .listarZonas(Optional.ofNullable(dispositivoId), Optional.ofNullable(activa))
                .stream()
                .map(ZonaResponse::from)
                .toList();

        return ResponseEntity.ok(zonas);
    }

    @GetMapping("/{zonaId}")
    public ResponseEntity<ZonaResponse> obtener(@PathVariable Long zonaId) {
        return ResponseEntity.ok(ZonaResponse.from(zonaService.obtenerZona(zonaId)));
    }

    @PatchMapping("/{zonaId}/activa")
    public ResponseEntity<ZonaResponse> actualizarActiva(
            @PathVariable Long zonaId,
            @RequestBody ZonaActivaRequest request) {

        User usuario = obtenerUsuarioAutenticado();
        Zona zona = zonaService.actualizarActiva(zonaId, request.activa(), usuario);
        return ResponseEntity.ok(ZonaResponse.from(zona));
    }

    @GetMapping("/{zonaId}/programacion")
    public ResponseEntity<ProgramacionHorariaResponse> obtenerProgramacion(@PathVariable Long zonaId) {
        zonaService.obtenerZona(zonaId);
        ProgramacionHorariaResponse response = programacionZonaService.obtenerPorZona(zonaId)
                .map(ProgramacionHorariaResponse::from)
                .orElse(null);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{zonaId}/programacion")
    public ResponseEntity<ProgramacionHorariaResponse> actualizarProgramacion(
            @PathVariable Long zonaId,
            @Valid @RequestBody ProgramacionHorariaRequest request) {

        zonaService.obtenerZona(zonaId);
        ProgramacionZona programacion = programacionZonaService.guardarProgramacion(zonaId, request);
        return ResponseEntity.ok(ProgramacionHorariaResponse.from(programacion));
    }

    private User obtenerUsuarioAutenticado() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl userDetails) {
            return userRepository.findById(userDetails.getId()).orElse(null);
        }
        return null;
    }

    public record ZonaResponse(
            Long id,
            Long dispositivoId,
            String nombre,
            String descripcion,
            String ubicacion,
            String estadoActual,
            String modoControl,
            Boolean activa,
            ProgramacionHorariaResponse programacion,
            java.util.List<SensorResponse> sensores
    ) {
        public static ZonaResponse from(Zona zona) {
            Long dispositivoId = zona.getDispositivo() != null ? zona.getDispositivo().getId() : null;
            ProgramacionHorariaResponse programacion = zona.getProgramacion() != null
                    ? ProgramacionHorariaResponse.from(zona.getProgramacion())
                    : null;
            java.util.List<SensorResponse> sensores = zona.getSensores() == null
                    ? java.util.List.of()
                    : zona.getSensores().stream().map(ZonaController::toSensorResponse).toList();

            return new ZonaResponse(
                    zona.getId(),
                    dispositivoId,
                    zona.getNombre(),
                    zona.getDescripcion(),
                    zona.getUbicacion(),
                    zona.getEstadoActual(),
                    zona.getModoControl(),
                    zona.getActiva(),
                    programacion,
                    sensores
            );
        }
    }

    private static SensorResponse toSensorResponse(Sensor sensor) {
        return SensorResponse.builder()
                .id(sensor.getId())
                .codigo(sensor.getCodigo())
                .tipoSensor(sensor.getTipoSensor())
                .ubicacionDetalle(sensor.getUbicacionDetalle())
                .estadoActual(sensor.getEstadoActual())
                .ultimoReporte(sensor.getUltimoReporte())
                .activo(sensor.getActivo())
                .build();
    }

    public record ZonaActivaRequest(boolean activa) {
    }
}
