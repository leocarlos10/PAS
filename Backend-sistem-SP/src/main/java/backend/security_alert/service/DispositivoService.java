package backend.security_alert.service;

import backend.security_alert.exception.NotFoundException;
import backend.security_alert.exception.BadRequestCustomException;
import backend.security_alert.models.Dispositivo;
import backend.security_alert.repository.DispositivoRepository;
import backend.security_alert.service.mqtt.MqttCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DispositivoService {

    private final DispositivoRepository dispositivoRepository;
    private final MqttCommandService mqttCommandService;

    @Transactional(readOnly = true)
    public List<Dispositivo> listarDispositivos() {
        return dispositivoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Dispositivo obtenerDispositivo(Long id) {
        return dispositivoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Dispositivo no encontrado: " + id));
    }

    public void enviarConfigWifi(Long dispositivoId, String ssid, String password) {
        Dispositivo dispositivo = obtenerDispositivo(dispositivoId);

        String topicConfig = calcularTopicConfig(dispositivo);
        if (topicConfig == null || topicConfig.isBlank()) {
            throw new BadRequestCustomException("El dispositivo no tiene topicEstado/topicComando configurado para derivar el topic de config.");
        }

        Map<String, Object> payload = Map.of(
                "action", "set_wifi",
                "ssid", ssid,
                "password", password
        );

        mqttCommandService.publicarJson(topicConfig, payload, 1, false);
    }

    static String calcularTopicConfig(Dispositivo dispositivo) {
        if (dispositivo == null) return null;

        String topicEstado = dispositivo.getTopicEstado();
        if (topicEstado != null && !topicEstado.isBlank()) {
            if (topicEstado.endsWith("/estado")) return topicEstado.substring(0, topicEstado.length() - "/estado".length()) + "/config";
            if (topicEstado.contains("/estado/")) return topicEstado.replace("/estado/", "/config/");
            return topicEstado.endsWith("/") ? (topicEstado + "config") : (topicEstado + "/config");
        }

        String topicComando = dispositivo.getTopicComando();
        if (topicComando != null && !topicComando.isBlank()) {
            if (topicComando.endsWith("/comando")) return topicComando.substring(0, topicComando.length() - "/comando".length()) + "/config";
            if (topicComando.contains("/comando/")) return topicComando.replace("/comando/", "/config/");
            return topicComando.endsWith("/") ? (topicComando + "config") : (topicComando + "/config");
        }

        return null;
    }
}
