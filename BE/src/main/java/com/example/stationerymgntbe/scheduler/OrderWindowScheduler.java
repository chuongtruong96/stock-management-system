package com.example.stationerymgntbe.scheduler;

import com.example.stationerymgntbe.service.BroadcastService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component @EnableScheduling
@RequiredArgsConstructor
public class OrderWindowScheduler {

    private final BroadcastService broadcast;

    // 00:00 ngày 1 mỗi tháng
    @Scheduled(cron = "0 0 0 1 * ?")
    public void openWindow() {
        broadcast.orderWindow(true);
    }

    // 08:00 sáng ngày 8 mỗi tháng
    @Scheduled(cron = "0 0 8 8 * ?")
    public void closeWindow() {
        broadcast.orderWindow(false);
    }
}
