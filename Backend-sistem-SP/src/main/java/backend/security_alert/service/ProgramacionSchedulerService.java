package backend.security_alert.service;

import backend.security_alert.models.ProgramacionZona;
import backend.security_alert.models.Zona;
import backend.security_alert.repository.ProgramacionZonaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProgramacionSchedulerService {

    private static final Map<DayOfWeek, String> DIAS_POR_DIA_SEMANA = Map.of(
            DayOfWeek.MONDAY, "lunes",
            DayOfWeek.TUESDAY, "martes",
            DayOfWeek.WEDNESDAY, "miercoles",
            DayOfWeek.THURSDAY, "jueves",
            DayOfWeek.FRIDAY, "viernes",
            DayOfWeek.SATURDAY, "sabado",
            DayOfWeek.SUNDAY, "domingo"
    );

    private final ProgramacionZonaRepository programacionZonaRepository;
    private final ZonaCommandService zonaCommandService;

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void ejecutarProgramaciones() {
        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now().withSecond(0).withNano(0);
        String diaActual = DIAS_POR_DIA_SEMANA.get(hoy.getDayOfWeek());

        List<ProgramacionZona> programaciones = programacionZonaRepository.findAllByActivaTrue();
        for (ProgramacionZona programacion : programaciones) {
            if (!aplicaParaDia(programacion, diaActual)) {
                continue;
            }

            Zona zona = programacion.getZona();
            if (zona == null || !"AUTOMATICO".equalsIgnoreCase(zona.getModoControl())) {
                continue;
            }

            LocalTime horaArmado = LocalTime.parse(programacion.getHoraInicio());
            LocalTime horaDesarmado = LocalTime.parse(programacion.getHoraFin());

            if (ahora.equals(horaArmado) && !hoy.equals(programacion.getUltimoArmadoEjecutado())) {
                ZonaComandoResult resultado = zonaCommandService.ejecutarComandoProgramado(zona, true);
                programacion.setUltimoArmadoEjecutado(hoy);
                programacionZonaRepository.save(programacion);
                if (resultado.advertencia() != null) {
                    log.warn("Programación automática zona {} armada con advertencia: {}", zona.getId(), resultado.advertencia());
                } else {
                    log.info("Programación automática: zona {} armada", zona.getId());
                }
            }

            if (ahora.equals(horaDesarmado) && !hoy.equals(programacion.getUltimoDesarmadoEjecutado())) {
                ZonaComandoResult resultado = zonaCommandService.ejecutarComandoProgramado(zona, false);
                programacion.setUltimoDesarmadoEjecutado(hoy);
                programacionZonaRepository.save(programacion);
                if (resultado.advertencia() != null) {
                    log.warn("Programación automática zona {} desarmada con advertencia: {}", zona.getId(), resultado.advertencia());
                } else {
                    log.info("Programación automática: zona {} desarmada", zona.getId());
                }
            }
        }
    }

    private boolean aplicaParaDia(ProgramacionZona programacion, String diaActual) {
        List<String> dias = programacion.getDiasSemana();
        if (dias == null || dias.isEmpty()) {
            return false;
        }

        return dias.stream()
                .map(dia -> dia.toLowerCase(Locale.ROOT))
                .anyMatch(dia -> "todos".equals(dia) || dia.equals(diaActual));
    }
}
