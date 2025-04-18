package com.example.stationerymgntbe.dto;

import com.example.stationerymgntbe.enums.UserRole;
import lombok.Data;

@Data
public class UserInputDTO {
    private String username;
    private String password;
    private UserRole role;
    private Integer departmentId;
}
