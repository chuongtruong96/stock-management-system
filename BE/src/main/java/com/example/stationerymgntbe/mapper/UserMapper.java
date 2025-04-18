package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.UserInputDTO;
import com.example.stationerymgntbe.dto.UserResponseDTO;
import com.example.stationerymgntbe.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring"
)
public interface UserMapper {

    @Mappings({
        @Mapping(source = "userId", target = "id"),
        @Mapping(source = "username", target = "username"),
        @Mapping(source = "role", target = "role", qualifiedByName = "roleToString"),
        @Mapping(source = "department.departmentId", target = "departmentId"),
        @Mapping(source = "department.name",         target = "departmentName"),
        @Mapping(source = "department.email",        target = "departmentEmail")
       
    })
    UserResponseDTO toDto(User user);

    @Mappings({
        @Mapping(source = "departmentId", target = "department.departmentId"),
        
    })
    User toEntity(UserInputDTO dto);


    @Named("roleToString")
    public static String roleToString(Enum<?> role) {
        return (role == null) ? null : role.name().toLowerCase();
    }
}
