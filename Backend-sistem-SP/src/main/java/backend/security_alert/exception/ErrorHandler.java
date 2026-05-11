
import backend.security_alert.dto.common.Response;
import backend.security_alert.dto.common.ValidationErrorDetail;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler; 
import backend.security_alert.exception.*; 

@ControllerAdvice
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
                        HttpStatus.BAD_REQUEST.getReasonPhrase(),
                        errorList),
                new HttpHeaders(),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public final ResponseEntity<Response<Object>> handleGeneralExceptions(
            Exception ex) {
        List<String> errorList = Collections.singletonList(ex.getMessage());
        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                        errorList),
                new HttpHeaders(),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(RuntimeException.class)
    public final ResponseEntity<Response<Object>> handleRuntimeExceptions(
            RuntimeException ex) {
        List<String> errorList = Collections.singletonList(ex.getMessage());
        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                        errorList),
                new HttpHeaders(),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(DataExistException.class)
    public final ResponseEntity<Response<Object>> dataExistException(DataExistException ex) {
        
        List<String> errors = Collections.singletonList(ex.getMessage());
        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.CONFLICT.value(),
                        HttpStatus.CONFLICT.getReasonPhrase(),
                        errors),
                new HttpHeaders(),
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
                new HttpHeaders(),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestCustomException.class)
    public final ResponseEntity<Response<Object>> handleBadRequestCustomException(BadRequestCustomException ex) {
        List<String> errors = Collections.singletonList(ex.getMessage());
        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.BAD_REQUEST.value(),
                        HttpStatus.BAD_REQUEST.getReasonPhrase(),
                        errors),
                new HttpHeaders(),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public final ResponseEntity<Response<Object>> handleAccessDeniedException(
            AccessDeniedException ex) {
        List<String> errors = Collections.singletonList(
                "Access Denied: You do not have permission to access this resource.");
        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.FORBIDDEN.value(),
                        HttpStatus.FORBIDDEN.getReasonPhrase(),
                        errors),
                new HttpHeaders(),
                HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public final ResponseEntity<Response<Object>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex) {
        List<String> errors = Collections.singletonList(ex.getMessage());
        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.METHOD_NOT_ALLOWED.value(), // Código 405
                        "Método No Permitido",
                        errors),
                new HttpHeaders(),
                HttpStatus.METHOD_NOT_ALLOWED // HTTP Status 405
        );
    }

    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<Response<Object>> handleNoResourceFoundException(
            org.springframework.web.servlet.resource.NoResourceFoundException ex) {
        List<String> errors = Collections.singletonList("El recurso solicitado no existe.");
        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.NOT_FOUND.value(),
                        HttpStatus.NOT_FOUND.getReasonPhrase(),
                        errors),
                new HttpHeaders(),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(org.springframework.web.servlet.NoHandlerFoundException.class)
    public ResponseEntity<Response<Object>> handleNoHandlerFoundException(
            org.springframework.web.servlet.NoHandlerFoundException ex) {
        List<String> errors = Collections.singletonList("No se encontró un manejador para la ruta solicitada.");
        return new ResponseEntity<>(
                mappingError(
                        HttpStatus.NOT_FOUND.value(),
                        HttpStatus.NOT_FOUND.getReasonPhrase(),
                        errors),
                new HttpHeaders(),
                HttpStatus.NOT_FOUND);
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
