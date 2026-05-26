package backend.security_alert.models.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Converter
public class DiasSemanaConverter implements AttributeConverter<List<String>, String> {

    private static final String SEPARATOR = ",";

    @Override
    public String convertToDatabaseColumn(List<String> diasSemana) {
        if (diasSemana == null || diasSemana.isEmpty()) {
            return "";
        }
        return diasSemana.stream()
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(dia -> !dia.isBlank())
                .collect(Collectors.joining(SEPARATOR));
    }

    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(dbData.split(SEPARATOR))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(dia -> !dia.isBlank())
                .collect(Collectors.toCollection(ArrayList::new));
    }
}
