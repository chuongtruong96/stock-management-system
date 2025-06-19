package com.example.stationerymgntbe.dto;
import  lombok.Data;
import java.util.Map;
@Data
public class OrderMetadataDTO {
    private String createdByIp;
    private String userAgent;
    private String deviceInfo;
    private Map<String, Object> additionalInfo;
}
