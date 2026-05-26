package backend.security_alert.controller;

import backend.security_alert.dto.evento.EventoHistorialDTO;
import backend.security_alert.service.EventoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/eventos")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService eventoService;

    @GetMapping("/historial")
    public Page<EventoHistorialDTO> getHistorial(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long zonaId,
            @RequestParam(required = false) String tipoEvento,
            @RequestParam(required = false) String sensorCodigo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta) {

        return eventoService.obtenerHistorialPaginado(
                page, size, zonaId, tipoEvento, sensorCodigo, fechaDesde, fechaHasta);
    }

}
