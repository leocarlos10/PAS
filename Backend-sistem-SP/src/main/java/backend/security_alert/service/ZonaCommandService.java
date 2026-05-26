package backend.security_alert.service;

import backend.security_alert.models.ComandoControl;
import backend.security_alert.models.Dispositivo;
import backend.security_alert.models.User;
import backend.security_alert.models.Zona;
import backend.security_alert.repository.ComandoControlRepository;
import backend.security_alert.repository.ZonaRepository;
import backend.security_alert.service.mqtt.MqttCommandService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ZonaCommandService {

    private final ZonaRepository zonaRepository;
    private final ComandoControlRepository comandoControlRepository;
    private final MqttCommandService mqttCommandService;
    private final DispositivoConnectivityService dispositivoConnectivityService;
    private final ObjectMapper objectMapper;

    @Transactional
    public ZonaComandoResult ejecutarComandoManual(Zona zona, boolean activa, User usuario) {
        return ejecutarComando(zona, activa, usuario, "MANUAL");
    }

    @Transactional
    public ZonaComandoResult ejecutarComandoProgramado(Zona zona, boolean activa) {
        return ejecutarComando(zona, activa, null, "PROGRAMADO");
    }

    private ZonaComandoResult ejecutarComando(Zona zona, boolean activa, User usuario, String origen) {
        String accion = activa ? "ARMAR" : "DESARMAR";

        zona.setActiva(activa);
        zona.setEstadoActual(accion.equals("ARMAR") ? "ARMADA" : "DESARMADA");

        boolean tieneProgramacionActiva = zona.getProgramaciones() != null
                && zona.getProgramaciones().stream().anyMatch(p -> Boolean.TRUE.equals(p.getActiva()));
        if (tieneProgramacionActiva) {
            zona.setModoControl("AUTOMATICO");
        }

        Zona guardada = zonaRepository.save(zona);

        Dispositivo dispositivo = guardada.getDispositivo();
        String topicComando = dispositivo != null ? dispositivo.getTopicComando() : null;
        boolean dispositivoConectado = dispositivoConnectivityService.isConectado(dispositivo);
        boolean comandoEnviadoBroker = mqttCommandService.publicarComando(topicComando, accion);
        String advertencia = construirAdvertencia(dispositivoConectado, comandoEnviadoBroker);

        registrarComando(guardada, usuario, accion, topicComando, origen);

        log.info("Comando {} procesado para zona {} (origen={}, dispositivoConectado={}, mqtt={})",
                accion, guardada.getId(), origen, dispositivoConectado, comandoEnviadoBroker);

        return new ZonaComandoResult(guardada, dispositivoConectado, comandoEnviadoBroker, advertencia);
    }

    private String construirAdvertencia(boolean dispositivoConectado, boolean comandoEnviadoBroker) {
        if (!dispositivoConectado) {
            return "El dispositivo no está conectado. El estado se actualizó en el sistema, pero el ESP32 podría no ejecutar el comando.";
        }
        if (!comandoEnviadoBroker) {
            return "No se pudo enviar el comando al broker MQTT. El estado se actualizó solo en el sistema.";
        }
        return null;
    }

    private void registrarComando(Zona zona, User usuario, String accion, String topicComando, String origen) {
        ComandoControl comando = new ComandoControl();
        comando.setZona(zona);
        comando.setUsuario(usuario);
        comando.setAccion(accion);
        comando.setTopicEnviado(topicComando);
        comando.setPayload(construirPayload(accion, origen));
        comandoControlRepository.save(comando);
    }

    private String construirPayload(String accion, String origen) {
        try {
            return objectMapper.writeValueAsString(
                    new ComandoPayload(accion, origen, java.time.Instant.now().toString())
            );
        } catch (Exception e) {
            log.warn("No se pudo serializar payload del comando", e);
            return "{\"accion\":\"" + accion + "\",\"origen\":\"" + origen + "\"}";
        }
    }

    private record ComandoPayload(String accion, String origen, String timestamp) {
    }
}
