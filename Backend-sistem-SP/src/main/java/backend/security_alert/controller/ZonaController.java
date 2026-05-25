package backend.security_alert.controller;

import backend.security_alert.models.Zona;
import backend.security_alert.service.ZonaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/zonas")
@RequiredArgsConstructor
public class ZonaController {

    private final ZonaService zonaService;

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
    public ResponseEntity<ZonaActivaResponse> actualizarActiva(
            @PathVariable Long zonaId,
            @RequestBody ZonaActivaRequest request) {

        Zona zona = zonaService.actualizarActiva(zonaId, request.activa());
        return ResponseEntity.ok(new ZonaActivaResponse(zona.getId(), zona.getNombre(), zona.getActiva()));
    }

    public record ZonaResponse(
            Long id,
            Long dispositivoId,
            String nombre,
            String descripcion,
            String ubicacion,
            String estadoActual,
            String modoControl,
            Boolean activa
    ) {
        public static ZonaResponse from(Zona zona) {
            Long dispositivoId = (zona.getDispositivo() != null) ? zona.getDispositivo().getId() : null;
            return new ZonaResponse(
                    zona.getId(),
                    dispositivoId,
                    zona.getNombre(),
                    zona.getDescripcion(),
                    zona.getUbicacion(),
                    zona.getEstadoActual(),
                    zona.getModoControl(),
                    zona.getActiva()
            );
        }
    }

    public record ZonaActivaRequest(boolean activa) {
    }

    public record ZonaActivaResponse(Long id, String nombre, Boolean activa) {
    }
}
