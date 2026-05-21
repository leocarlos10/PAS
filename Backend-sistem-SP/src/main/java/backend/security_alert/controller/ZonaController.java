package backend.security_alert.controller;

import backend.security_alert.models.Zona;
import backend.security_alert.service.ZonaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/zonas")
@RequiredArgsConstructor
public class ZonaController {

    private final ZonaService zonaService;

    @PatchMapping("/{zonaId}/activa")
    public ResponseEntity<ZonaActivaResponse> actualizarActiva(
            @PathVariable Long zonaId,
            @RequestBody ZonaActivaRequest request) {

        Zona zona = zonaService.actualizarActiva(zonaId, request.activa());
        return ResponseEntity.ok(new ZonaActivaResponse(zona.getId(), zona.getNombre(), zona.getActiva()));
    }

    public record ZonaActivaRequest(boolean activa) {
    }

    public record ZonaActivaResponse(Long id, String nombre, Boolean activa) {
    }
}

