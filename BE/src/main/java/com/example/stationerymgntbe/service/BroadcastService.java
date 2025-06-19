package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.OrderStatusDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BroadcastService {

    private final SimpMessagingTemplate template;   // auto‑wire bởi Spring

    /* ---- ORDER STATUS ---- */
    public void orderStatusChanged(OrderStatusDTO dto) {
        // 1) Admin dashboard cần tổng pending
        template.convertAndSend("/topic/orders/pending", dto);
        // 2) Phòng ban nhận kết quả của đơn mình
        if (dto.getDepartmentId() != null) {
            template.convertAndSend(
                "/topic/orders/" + dto.getDepartmentId(), dto);
        }
    }

    /* ---- Mở / đóng cửa sổ đặt hàng ---- */
    public void orderWindow(boolean open) {
        template.convertAndSend("/topic/order-window",
                java.util.Map.of("open", open));
    }
}
