package backend.security_alert.service;

import backend.security_alert.exception.NotFoundException;
import backend.security_alert.exception.BadRequestCustomException;
import backend.security_alert.models.Dispositivo;
import backend.security_alert.repository.DispositivoRepository;
import backend.security_alert.service.mqtt.MqttCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
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

    @Transactional
    public void enviarConfigWifi(Long dispositivoId, String ssid, String password) {
        Dispositivo dispositivo = obtenerDispositivo(dispositivoId);
        
        // Persistir en BD
        dispositivo.setWifiSsid(ssid);
        dispositivo.setWifiPassword(password);
        dispositivoRepository.save(dispositivo);

        String topicConfig = calcularTopicConfig(dispositivo);
        if (topicConfig == null || topicConfig.isBlank()) {
            throw new BadRequestCustomException("El dispositivo no tiene topicEstado/topicComando configurado para derivar el topic de config.");
        }

        Map<String, Object> payload = buildWifiPayload(ssid, password);
        mqttCommandService.publicarJson(topicConfig, payload, 1, false);
    }

    @Transactional
    public int enviarConfigWifiMultiple(List<Long> dispositivoIds, String ssid, String password) {
        List<Dispositivo> dispositivos = (dispositivoIds == null || dispositivoIds.isEmpty())
                ? dispositivoRepository.findAll()
                : dispositivoRepository.findAllById(dispositivoIds);

        int sent = 0;
        for (Dispositivo d : dispositivos) {
            try {
                // Persistir en BD
                d.setWifiSsid(ssid);
                d.setWifiPassword(password);
                dispositivoRepository.save(d);

                String topic = calcularTopicConfig(d);
                if (topic == null || topic.isBlank()) {
                    log.warn("Omitiendo dispositivo {} (ID:{}): topicConfig no disponible", d.getNombre(), d.getId());
                    continue;
                }

                Map<String, Object> payload = buildWifiPayload(ssid, password);
                mqttCommandService.publicarJson(topic, payload, 1, false);
                log.info("Configuración WiFi enviada y guardada. dispositivo={} topic={}", d.getId(), topic);
                sent++;
            } catch (Exception e) {
                log.error("Error procesando configuración WiFi para dispositivo {}", d.getId(), e);
            }
        }
        return sent;
    }

    public backend.security_alert.dto.dispositivo.WifiConfigBatchResponse enviarConfigWifiBatch(List<Long> dispositivoIds, String ssid, String password) {
        int sent = enviarConfigWifiMultiple(dispositivoIds, ssid, password);
        int total = (dispositivoIds == null || dispositivoIds.isEmpty()) ? (int) dispositivoRepository.count() : dispositivoIds.size();
        
        return new backend.security_alert.dto.dispositivo.WifiConfigBatchResponse(
                "Configuración WiFi enviada a " + sent + " dispositivo(s)",
                sent,
                total - sent,
                dispositivoIds
        );
    }

    private Map<String, Object> buildWifiPayload(String ssid, String password) {
        return Map.of(
                "action", "set_wifi",
                "ssid", ssid,
                "password", password
        );
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
