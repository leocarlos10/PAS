package backend.security_alert.service;

import backend.security_alert.dto.evento.EventoHistorialDTO;
import backend.security_alert.dto.evento.EventoRequestDTO;
import backend.security_alert.models.Evento;
import backend.security_alert.models.Sensor;
import backend.security_alert.models.Zona;
import backend.security_alert.repository.EventoRepository;
import backend.security_alert.repository.SensorRepository;
import backend.security_alert.repository.ZonaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EventoService {

    private final EventoRepository eventoRepository;
    private final ZonaRepository zonaRepository;
    private final SensorRepository sensorRepository;
    private final AlertaService alertaService;

    @Transactional(readOnly = true)
    public Page<EventoHistorialDTO> obtenerHistorialPaginado(
            int page,
            int size,
            Long zonaId,
            String tipoEvento,
            String sensorCodigo,
            LocalDate fechaDesde,
            LocalDate fechaHasta) {
        Specification<Evento> spec = (root, query, cb) -> cb.conjunction();

        if (zonaId != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("zona").get("id"), zonaId));
        }

        if (tipoEvento != null && !tipoEvento.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("tipoEvento"), tipoEvento));
        }

        if (sensorCodigo != null && !sensorCodigo.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("sensor").get("codigo"), sensorCodigo));
        }

        if (fechaDesde != null) {
            LocalDateTime inicio = fechaDesde.atStartOfDay();
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("fechaHora"), inicio));
        }

        if (fechaHasta != null) {
            LocalDateTime finExclusive = fechaHasta.plusDays(1).atStartOfDay();
            spec = spec.and((root, query, cb) ->
                    cb.lessThan(root.get("fechaHora"), finExclusive));
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<Evento> eventos = eventoRepository.findAll(spec, pageable);

        return eventos.map(this::toHistorialDTO);
    }

    @Transactional
    public Evento procesarEventoDesdeDispositivo(EventoRequestDTO dto) {
        Zona zona = zonaRepository.findById(dto.getIdZona())
                .orElseThrow(() -> new EntityNotFoundException("Zona no encontrada con id: " + dto.getIdZona()));

        Sensor sensor = null;
        if (dto.getIdSensor() != null) {
            sensor = sensorRepository.findById(dto.getIdSensor()).orElse(null);
        }

        Evento evento = new Evento();
        evento.setZona(zona);
        evento.setSensor(sensor);
        evento.setTipoEvento(dto.getTipoEvento());
        evento.setDescripcion(dto.getDescripcion());
        evento.setFechaHora(LocalDateTime.now());

        Evento guardado = eventoRepository.save(evento);

        if ("ALTA".equals(dto.getSeveridad())) {
            alertaService.generarAlerta(guardado);
        }

        return guardado;
    }

    private EventoHistorialDTO toHistorialDTO(Evento evento) {
        EventoHistorialDTO dto = new EventoHistorialDTO();
        dto.setIdEvento(evento.getId());
        dto.setFechaHora(evento.getFechaHora());
        dto.setZonaNombre(evento.getZona() != null ? evento.getZona().getNombre() : null);
        dto.setSensorCodigo(evento.getSensor() != null ? evento.getSensor().getCodigo() : null);
        dto.setSensorNombre(evento.getSensor() != null ? evento.getSensor().getTipoSensor() : null);
        dto.setTipoEvento(evento.getTipoEvento());
        dto.setDescripcion(evento.getDescripcion());
        dto.setSeveridad(null);
        return dto;
    }
}
