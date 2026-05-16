package backend.security_alert.controller;

import backend.security_alert.dto.evento.EventoHistorialDTO;
import backend.security_alert.dto.evento.EventoRequestDTO;
import backend.security_alert.models.Evento;
import backend.security_alert.service.EventoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService eventoService;

    @GetMapping("/historial")
    public Page<EventoHistorialDTO> getHistorial(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long zonaId,
            @RequestParam(required = false) String severidad) {

        return eventoService.obtenerHistorialPaginado(page, size, zonaId, severidad);
    }

    @PostMapping
    public ResponseEntity<Long> recibirEvento(@RequestBody EventoRequestDTO request) {
        Evento evento = eventoService.procesarEventoDesdeDispositivo(request);
        return ResponseEntity.ok(evento.getId());
    }
}
