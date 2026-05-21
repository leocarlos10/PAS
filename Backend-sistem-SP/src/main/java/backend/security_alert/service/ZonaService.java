package backend.security_alert.service;

import backend.security_alert.exception.NotFoundException;
import backend.security_alert.models.Dispositivo;
import backend.security_alert.models.Zona;
import backend.security_alert.repository.ZonaRepository;
import backend.security_alert.service.mqtt.MqttCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ZonaService {

    private final ZonaRepository zonaRepository;
    private final MqttCommandService mqttCommandService;

    @Transactional(readOnly = true)
    public List<Zona> listarZonas(Optional<Long> dispositivoId, Optional<Boolean> activa) {
        if (dispositivoId.isPresent() && activa.isPresent()) {
            return zonaRepository.findAllByDispositivoIdAndActiva(dispositivoId.get(), activa.get());
        }
        if (dispositivoId.isPresent()) {
            return zonaRepository.findAllByDispositivoId(dispositivoId.get());
        }
        if (activa.isPresent()) {
            return zonaRepository.findAllByActiva(activa.get());
        }
        return zonaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Zona obtenerZona(Long zonaId) {
        return zonaRepository.findById(zonaId)
                .orElseThrow(() -> new NotFoundException("Zona no encontrada: " + zonaId));
    }

    @Transactional
    public Zona actualizarActiva(Long zonaId, boolean activa) {
        Zona zona = zonaRepository.findById(zonaId)
                .orElseThrow(() -> new NotFoundException("Zona no encontrada: " + zonaId));

        zona.setActiva(activa);
        Zona guardada = zonaRepository.save(zona);

        Dispositivo dispositivo = guardada.getDispositivo();
        String topicComando = (dispositivo != null) ? dispositivo.getTopicComando() : null;
        String accion = activa ? "ARMAR" : "DESARMAR";
        mqttCommandService.publicarComando(topicComando, accion);

        return guardada;
    }
}
