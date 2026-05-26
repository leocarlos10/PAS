package backend.security_alert.controller;

import backend.security_alert.models.Dispositivo;
import backend.security_alert.service.DispositivoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dispositivos")
@RequiredArgsConstructor
public class DispositivoController {

    private final DispositivoService dispositivoService;

    @GetMapping
    public ResponseEntity<List<DispositivoResponse>> listar() {
        List<DispositivoResponse> dispositivos = dispositivoService.listarDispositivos()
                .stream()
                .map(DispositivoResponse::from)
                .toList();
        return ResponseEntity.ok(dispositivos);
    }

    @PostMapping("/{id}/config-wifi")
    public ResponseEntity<Map<String, Object>> configurarWifi(
            @PathVariable Long id,
            @RequestBody @Valid WifiConfigRequest request) {

        dispositivoService.enviarConfigWifi(id, request.ssid(), request.password());

        return ResponseEntity.ok(Map.of(
                "mensaje", "Configuración enviada. El dispositivo se reconectará en breve.",
                "dispositivoId", id
        ));
    }

        @PostMapping("/config-wifi-batch")
        public ResponseEntity<Map<String, Object>> configurarWifiBatch(
            @RequestBody @Valid WifiConfigBatchRequest request) {

        int sent = dispositivoService.enviarConfigWifiMultiple(request.dispositivoIds(), request.ssid(), request.password());

        return ResponseEntity.ok(Map.of(
            "mensaje", "Configuración enviada.",
            "enviados", sent
        ));
        }

    public record DispositivoResponse(
            Long id,
            String nombre,
            String tipo,
            String mac,
            String estadoConexion
    ) {
        public static DispositivoResponse from(Dispositivo d) {
            return new DispositivoResponse(d.getId(), d.getNombre(), d.getTipo(), d.getMac(), d.getEstadoConexion());
        }
    }

    public record WifiConfigRequest(
            @NotBlank @Size(max = 64) String ssid,
            @NotBlank @Size(max = 128) String password
    ) {
    }

        public record WifiConfigBatchRequest(
            List<Long> dispositivoIds,
            @NotBlank @Size(max = 64) String ssid,
            @NotBlank @Size(max = 128) String password
        ) {
        }
}

