package backend.security_alert.service.mqtt;

import backend.security_alert.models.Evento;
import backend.security_alert.models.Sensor;
import backend.security_alert.models.Zona;
import backend.security_alert.repository.EventoRepository;
import backend.security_alert.repository.SensorRepository;
import backend.security_alert.repository.ZonaRepository;
import backend.security_alert.sse.SseManager;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MqttDataService {

    private final ObjectMapper objectMapper;
    private final ZonaRepository zonaRepository;
    private final SensorRepository sensorRepository;
    private final EventoRepository eventoRepository;
    private final SseManager sseManager;

    @Transactional
    public void procesarMensaje(String topic, String payload) {
        Evento evento = persistirEvento(topic, payload);
        if (evento != null) {
            sseManager.enviarEvento("evento", eventoToSseData(evento, payload));
        } else {
            sseManager.enviarEvento("raw", payload);
        }
    }

    private Evento persistirEvento(String topic, String payload) {
        try {
            TopicData topicData = parseTopic(topic).orElse(null);
            if (topicData == null || topicData.zonaKey() == null) {
                log.debug("MQTT ignorado: topic no soportado o sin zona. topic='{}' payload='{}'", topic, payload);
                return null;
            }

            Zona zona = resolverZona(topicData.zonaKey());
            if (zona == null) {
                log.warn("MQTT ignorado: zona no encontrada. zonaKey='{}' topic='{}'", topicData.zonaKey(), topic);
                return null;
            }
            if (Boolean.FALSE.equals(zona.getActiva())) {
                log.info("MQTT ignorado: zona desactivada. zona='{}' topic='{}'", zona.getNombre(), topic);
                return null;
            }

            JsonNode json = safeReadTree(payload);
            String sensorCodigo = firstNonBlank(
                    textOrNull(json, "codigo_sensor"),
                    textOrNull(json, "id_sensor")
            );
            String tipoEvento = textOrNull(json, "tipo_evento");
            String tipoSensor = textOrNull(json, "tipo_sensor");
            LocalDateTime fechaHora = parseFechaHora(json);

            // Fallbacks from topic when payload is empty/minimal
            if (tipoSensor == null) tipoSensor = topicData.tipoSensor();
            if (tipoEvento == null) tipoEvento = topicData.accion();
            if (sensorCodigo == null) sensorCodigo = inferirCodigoSensor(topicData.zonaKey(), tipoSensor).orElse(null);

            if (sensorCodigo == null || tipoEvento == null) {
                log.warn(
                        "MQTT ignorado: faltan campos. topic='{}' zona='{}' sensorCodigo='{}' tipoSensor='{}' tipoEvento='{}' payload='{}'",
                        topic, zona.getNombre(), sensorCodigo, tipoSensor, tipoEvento, payload
                );
                return null;
            }

            // Tabla de sensores fija: NO crear sensores automáticamente.
            // Si existe el sensor, se actualiza su estadoActual/ultimoReporte.
            Sensor sensor = sensorRepository.findByCodigo(sensorCodigo).orElse(null);
            if (sensor == null) {
                log.warn("Sensor no encontrado (no se crea). codigo='{}' topic='{}' payload='{}'",
                        sensorCodigo, topic, payload);
            } else {
                if (sensor.getZona() != null && zona.getId() != null && !zona.getId().equals(sensor.getZona().getId())) {
                    log.warn("Sensor pertenece a otra zona. codigo='{}' zonaTopic='{}' zonaSensor='{}'",
                            sensorCodigo, zona.getNombre(), sensor.getZona().getNombre());
                }
                // Preferir la zona del sensor (fuente de verdad) si está definida
                if (sensor.getZona() != null) {
                    zona = sensor.getZona();
                }
                sensor.setUltimoReporte(LocalDateTime.now());
                sensorRepository.save(sensor);
            }

            Evento evento = new Evento();
            evento.setZona(zona);
            evento.setSensor(sensor);
            evento.setTipoEvento(tipoEvento);
            evento.setDescripcion(payload);
            evento.setFechaHora(fechaHora != null ? fechaHora : LocalDateTime.now());
            Evento guardado = eventoRepository.save(evento);
            log.info(
                    "Evento persistido: id={} zona='{}' sensor='{}' tipoSensor='{}' tipoEvento='{}' fechaHora={}",
                    guardado.getId(),
                    zona.getNombre(),
                    sensor != null ? sensor.getCodigo() : sensorCodigo,
                    sensor != null ? sensor.getTipoSensor() : tipoSensor,
                    guardado.getTipoEvento(),
                    guardado.getFechaHora()
            );
            return guardado;
        } catch (Exception e) {
            log.error("Error persistiendo evento MQTT. topic='{}' payload='{}'", topic, payload, e);
            return null;
        }
    }

    private Zona resolverZona(String zonaKey) {
        if (zonaKey == null || zonaKey.isBlank()) return null;

        // Prefer exact / ignore-case match by nombre
        Zona zona = zonaRepository.findByNombre(zonaKey).orElse(null);
        if (zona != null) return zona;
        zona = zonaRepository.findByNombreIgnoreCase(zonaKey).orElse(null);
        if (zona != null) return zona;

        // Normalized match: "zona1", "zona-1" -> "Zona 1"
        String normalizedKey = normalize(zonaKey);
        if (normalizedKey == null) return null;
        return zonaRepository.findAll().stream()
                .filter(z -> normalize(z.getNombre()).equals(normalizedKey))
                .findFirst()
                .orElse(null);
    }

    private static Optional<TopicData> parseTopic(String topic) {
        // Soporta:
        // - jardin/{zona}/sensores/estado
        // - jardin/{zona}/{tipo_sensor}/{accion}  (ej: jardin/zona1/magnetico/abierto)
        // - jardin/{zona}/tipo/accion            (tu ejemplo: jardin/zona1/tipo/accion)
        // - jardin/{zona}/eventos               (tu ejemplo: jardin/zona1/eventos)
        if (topic == null) return Optional.empty();
        String[] parts = topic.split("/");
        if (parts.length < 2) return Optional.empty();
        if (!"jardin".equals(parts[0])) return Optional.empty();
        String zonaKey = parts[1];
        String tipoSensor = parts.length >= 3 ? parts[2] : null;
        String accion = parts.length >= 4 ? parts[3] : null;

        // Cuando el topic es jardin/{zona}/eventos, el tipo/accion vienen en el payload
        if (parts.length == 3 && "eventos".equalsIgnoreCase(parts[2])) {
            tipoSensor = null;
            accion = null;
        }
        return Optional.of(new TopicData(zonaKey, blankToNull(tipoSensor), blankToNull(accion)));
    }

    private static Optional<String> inferirCodigoSensor(String zonaKey, String tipoSensor) {
        if (zonaKey == null || tipoSensor == null) return Optional.empty();
        Integer zonaNumero = extraerNumero(zonaKey);
        if (zonaNumero == null) return Optional.empty();

        String t = normalize(tipoSensor);
        if (t.contains("mag")) return Optional.of("Z" + zonaNumero + "-MAG-01");
        if (t.contains("mov")) return Optional.of("Z" + zonaNumero + "-MOV-01");
        return Optional.empty();
    }

    private static Integer extraerNumero(String s) {
        if (s == null) return null;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) {
                return Character.getNumericValue(c);
            }
        }
        return null;
    }

    private static String normalize(String s) {
        if (s == null) return "";
        return s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private static String textOrNull(JsonNode json, String field) {
        if (json == null || field == null) return null;
        JsonNode node = json.get(field);
        if (node == null || node.isNull()) return null;
        String value = node.asText();
        return value == null || value.isBlank() ? null : value;
    }

    private static String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }

    private static LocalDateTime parseFechaHora(JsonNode json) {
        if (json == null) return null;

        // Prefer explicit fecha_hora; fallback to ts
        String iso = textOrNull(json, "fecha_hora");
        if (iso == null) iso = textOrNull(json, "ts");
        if (iso == null) return null;

        try {
            // Accept Instant (e.g. 2026-05-19T12:34:56Z)
            Instant instant = Instant.parse(iso);
            return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        } catch (DateTimeParseException ignored) {
        }

        try {
            // Accept local datetime (e.g. 2026-05-19T07:34:56)
            return LocalDateTime.parse(iso);
        } catch (DateTimeParseException ignored) {
        }

        return null;
    }

    private JsonNode safeReadTree(String payload) {
        if (payload == null || payload.isBlank()) return null;
        try {
            return objectMapper.readTree(payload);
        } catch (Exception ignored) {
            return null;
        }
    }

    private static Object eventoToSseData(Evento evento, String rawPayload) {
        return new SseEventoDTO(
                evento.getId(),
                evento.getTipoEvento(),
                "INFO",
                evento.getFechaHora(),
                evento.getZona() != null ? evento.getZona().getId() : null,
                evento.getSensor() != null ? evento.getSensor().getId() : null,
                rawPayload
        );
    }

    public record SseEventoDTO(
            Long id,
            String tipoEvento,
            String severidad,
            LocalDateTime fechaHora,
            Long zonaId,
            Long sensorId,
            String payload
    ) {
    }

    private record TopicData(String zonaKey, String tipoSensor, String accion) {
    }
}
