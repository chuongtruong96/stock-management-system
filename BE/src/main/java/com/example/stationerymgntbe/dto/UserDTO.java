package com.example.stationerymgntbe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Integer id;
    private String username;
    private String email;
    private Integer departmentId;
    private String departmentName;
    private String roleName;
    private boolean active;
}