package backend.security_alert.service;

import backend.security_alert.dto.zona.SensorResponse;
import backend.security_alert.dto.zona.ZonaResponse;
import backend.security_alert.exception.NotFoundException;
import backend.security_alert.models.Dispositivo;
import backend.security_alert.models.Sensor;
import backend.security_alert.models.Zona;
import backend.security_alert.repository.ZonaRepository;
import backend.security_alert.service.mqtt.MqttCommandService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ZonaService {

    private final ZonaRepository zonaRepository;
    private final MqttCommandService mqttCommandService;

    @Transactional(readOnly = true)
    public List<ZonaResponse> listAll() {
        return zonaRepository.findAll().stream()
                .map(this::toZonaResponse)
                .toList();
    }

    @Transactional
    public ZonaResponse actualizarActiva(Long zonaId, boolean activa) {
        Zona zona = zonaRepository.findById(zonaId)
                .orElseThrow(() -> new NotFoundException("Zona no encontrada: " + zonaId));

        zona.setActiva(activa);
        zona.setEstadoActual(activa ? "ARMADA" : "DESARMADA");
        Zona guardada = zonaRepository.save(zona);

        Dispositivo dispositivo = guardada.getDispositivo();
        String topicComando = (dispositivo != null) ? dispositivo.getTopicComando() : null;
        mqttCommandService.publicarComandoZona(topicComando, guardada.getNombre(), activa);

        return toZonaResponse(guardada);
    }

    private ZonaResponse toZonaResponse(Zona zona) {
        List<SensorResponse> sensores = zona.getSensores().stream()
                .map(this::toSensorResponse)
                .toList();

        return ZonaResponse.builder()
                .id(zona.getId())
                .nombre(zona.getNombre())
                .descripcion(zona.getDescripcion())
                .ubicacion(zona.getUbicacion())
                .estadoActual(zona.getEstadoActual())
                .modoControl(zona.getModoControl())
                .activa(zona.getActiva())
                .sensores(sensores)
                .build();
    }

    private SensorResponse toSensorResponse(Sensor sensor) {
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
}
