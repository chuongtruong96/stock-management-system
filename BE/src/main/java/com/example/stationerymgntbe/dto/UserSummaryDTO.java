package com.example.stationerymgntbe.dto;
import lombok.Data;
@Data
public class UserSummaryDTO {
    private Integer id;
    private String username;
    private String email;
    private boolean active;
    private String departmentName;
    private String roleName;
}