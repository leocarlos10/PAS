package backend.security_alert.service;

import backend.security_alert.models.Alerta;
import backend.security_alert.models.Evento;
import backend.security_alert.repository.AlertaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlertaService {

    private final AlertaRepository alertaRepository;

    @Transactional
    public Alerta generarAlerta(Evento evento) {
        Alerta alerta = new Alerta();
        alerta.setEvento(evento);
        alerta.setEstadoAlerta("PENDIENTE");
        return alertaRepository.save(alerta);
    }
}
