package backend.security_alert.controller;

import backend.security_alert.dto.common.Response;
import backend.security_alert.dto.zona.ZonaActivaRequest;
import backend.security_alert.dto.zona.ZonaResponse;
import backend.security_alert.exception.BadRequestCustomException;
import backend.security_alert.service.ZonaService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/zonas")
@RequiredArgsConstructor
public class ZonaController {

    private final ZonaService zonaService;

    @GetMapping
    public ResponseEntity<Response<List<ZonaResponse>>> listAll() {
        List<ZonaResponse> zonas = zonaService.listAll();

        Response<List<ZonaResponse>> response = Response.<List<ZonaResponse>>builder()
                .responseCode(HttpStatus.OK.value())
                .responseMessage("SUCCESS")
                .data(zonas)
                .build();

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{zonaId}/activa")
    public ResponseEntity<Response<ZonaResponse>> actualizarActiva(
            @PathVariable Long zonaId,
            @RequestBody ZonaActivaRequest request) {

        if (request.getActiva() == null) {
            throw new BadRequestCustomException("El campo activa es requerido");
        }

        ZonaResponse zona = zonaService.actualizarActiva(zonaId, request.getActiva());

        Response<ZonaResponse> response = Response.<ZonaResponse>builder()
                .responseCode(HttpStatus.OK.value())
                .responseMessage("SUCCESS")
                .data(zona)
                .build();

        return ResponseEntity.ok(response);
    }
}
