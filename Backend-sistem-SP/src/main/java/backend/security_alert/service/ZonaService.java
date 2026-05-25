package backend.security_alert.service;

import backend.security_alert.exception.NotFoundException;
import backend.security_alert.models.User;
import backend.security_alert.models.Zona;
import backend.security_alert.repository.ZonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ZonaService {

    private final ZonaRepository zonaRepository;
    private final ZonaCommandService zonaCommandService;

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
        return zonaRepository.findAllWithRelations();
    }

    @Transactional(readOnly = true)
    public Zona obtenerZona(Long zonaId) {
        return zonaRepository.findByIdWithRelations(zonaId)
                .orElseThrow(() -> new NotFoundException("Zona no encontrada: " + zonaId));
    }

    @Transactional
    public Zona actualizarActiva(Long zonaId, boolean activa, User usuario) {
        Zona zona = zonaRepository.findByIdWithRelations(zonaId)
                .orElseThrow(() -> new NotFoundException("Zona no encontrada: " + zonaId));

        return zonaCommandService.ejecutarComandoManual(zona, activa, usuario);
    }
}
