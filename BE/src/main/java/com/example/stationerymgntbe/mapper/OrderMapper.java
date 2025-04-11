package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.OrderDTO;
import com.example.stationerymgntbe.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "employee.department.departmentId", target = "departmentId")
    @Mapping(target = "employeeName", expression = "java(order.getEmployee() != null ? mapEmployeeName(order.getEmployee().getFirstName(), order.getEmployee().getLastName()) : \"N/A\")")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(source = "updatedAt", target = "updatedAt")
    @Mapping(source = "adminComment", target = "adminComment")
    @Mapping(source = "approvedBy.username", target = "approvedByUsername")
    OrderDTO toOrderDTO(Order order);

    @Named("mapEmployeeName")
    default String mapEmployeeName(String firstName, String lastName) {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }
}