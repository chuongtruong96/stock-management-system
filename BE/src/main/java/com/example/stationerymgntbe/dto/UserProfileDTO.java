package com.example.stationerymgntbe.dto;
import  lombok.Data;
@Data
public class UserProfileDTO {
    private Integer id;
    private String username;
    private String email;
    private String departmentName;
    private String roleName;
}
