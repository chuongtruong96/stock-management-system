package com.example.stationerymgntbe.enums;

import lombok.Getter;

@Getter
public enum OrderStatus {
    pending("pending", "Order Created", 25, "Your order has been created and is ready for PDF export"),
    exported("exported", "PDF Exported", 50, "PDF has been exported. Please get it signed and upload back"),
    submitted("submitted", "Submitted for Approval", 75, "Signed PDF uploaded. Waiting for admin approval"),
    approved("approved", "Approved", 100, "Your order has been approved and will be processed"),
    rejected("rejected", "Rejected", 100, "Your order has been rejected. Please check admin comments");

    private final String code;
    private final String displayName;
    private final int progressPercentage;
    private final String description;

    OrderStatus(String code, String displayName, int progressPercentage, String description) {
        this.code = code;
        this.displayName = displayName;
        this.progressPercentage = progressPercentage;
        this.description = description;
    }

    public boolean canTransitionTo(OrderStatus newStatus) {
        return switch (this) {
            case pending -> newStatus == exported;
            case exported -> newStatus == submitted;
            case submitted -> newStatus == approved || newStatus == rejected;
            case approved, rejected -> false;
        };
    }
}