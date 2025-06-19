package com.example.stationerymgntbe.dto;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class DepartmentDTO {
    private Integer departmentId;
    private String name;
    private String email;
    
    // Backward compatibility
    public Integer getId() {
        return this.departmentId;
    }
    
    public void setId(Integer id) {
        this.departmentId = id;
    }
}
