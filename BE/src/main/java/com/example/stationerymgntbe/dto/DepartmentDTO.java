package com.example.stationerymgntbe.dto;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class DepartmentDTO {
    private Integer id;
    private String name;
    private String email;
}
