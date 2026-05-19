package backend.security_alert.exception;

import backend.security_alert.dto.common.Response;
import backend.security_alert.dto.common.ValidationErrorDetail;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ErrorHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Response<Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        List<ValidationErrorDetail> errorList = ex
                .getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new ValidationErrorDetail(error.getField(), error.getDefaultMessage()))
                .collect(Collectors.toList());

        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.BAD_REQUEST.value(),
                        "Error de validación",
                        errorList),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Response<Object>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex) {

        List<String> errors = Collections.singletonList(
                "El cuerpo de la solicitud está vacío o no es un JSON válido.");

        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.BAD_REQUEST.value(),
                        "Solicitud inválida",
                        errors),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataExistException.class)
    public ResponseEntity<Response<Object>> dataExistException(DataExistException ex) {
        List<String> errors = Collections.singletonList(ex.getMessage());

        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.CONFLICT.value(),
                        HttpStatus.CONFLICT.getReasonPhrase(),
                        errors),
                HttpStatus.CONFLICT);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Response<Object>> handleNotFoundException(
            NotFoundException ex) {
        List<String> errors = Collections.singletonList(ex.getMessage());

        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.NOT_FOUND.value(),
                        HttpStatus.NOT_FOUND.getReasonPhrase(),
                        errors),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UserInactiveException.class)
    public ResponseEntity<Response<Object>> handleUserInactiveException(
            UserInactiveException ex) {
        List<String> errors = Collections.singletonList(ex.getMessage());

        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.FORBIDDEN.value(),
                        HttpStatus.FORBIDDEN.getReasonPhrase(),
                        errors),
                HttpStatus.FORBIDDEN);
    }
    public ResponseEntity<Response<Object>> handleBadRequestCustomException(
            BadRequestCustomException ex) {
        List<String> errors = Collections.singletonList(ex.getMessage());

        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.BAD_REQUEST.value(),
                        HttpStatus.BAD_REQUEST.getReasonPhrase(),
                        errors),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Response<Object>> handleAccessDeniedException(
            AccessDeniedException ex) {
        List<String> errors = Collections.singletonList(
                "Access Denied: You do not have permission to access this resource.");

        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.FORBIDDEN.value(),
                        HttpStatus.FORBIDDEN.getReasonPhrase(),
                        errors),
                HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Response<Object>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex) {
        List<String> errors = Collections.singletonList(ex.getMessage());

        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.METHOD_NOT_ALLOWED.value(),
                        "Método No Permitido",
                        errors),
                HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Response<Object>> handleGeneralExceptions(
            Exception ex) {
        List<String> errorList = Collections.singletonList(ex.getMessage());

        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                        errorList),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Response<Object>> handleRuntimeExceptions(
            RuntimeException ex) {
        List<String> errorList = Collections.singletonList(ex.getMessage());

        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                        errorList),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private Response<Object> mappingError(
            int responseCode,
            String responseMessage,
            List<?> errorList) {
        return Response.builder()
                .responseCode(responseCode)
                .responseMessage(responseMessage)
                .errorList(errorList)
                .build();
    }
}
