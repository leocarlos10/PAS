package backend.security_alert.dto.common; 

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response<T> {

    private int responseCode;
    private String responseMessage;
    private T data;
    private List<?> errorList;
    private Integer pageNumber;
    private Integer pageSize;
    private Integer totalPage;
    private Long totalData;
}
