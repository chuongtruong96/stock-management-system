package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.OrderSummaryDTO;
import com.example.stationerymgntbe.entity.Order;
import com.example.stationerymgntbe.entity.OrderSummary;
import com.example.stationerymgntbe.enums.OrderStatus;
import com.example.stationerymgntbe.mapper.OrderSummaryMapper;
import com.example.stationerymgntbe.repository.OrderRepository;
import com.example.stationerymgntbe.repository.OrderSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderSummaryService {
    private final OrderSummaryRepository summaryRepo;
    private final OrderRepository orderRepo;
    private final OrderSummaryMapper mapper;
    public List<OrderSummaryDTO> fetchSummaries(Integer deptId, LocalDate from, LocalDate to) {
        List<OrderSummary> list = summaryRepo.findByDateBetween(from, to);
        return list.stream()
            .filter(s -> deptId==null || s.getDepartmentId().equals(deptId))
            .map(mapper::toDto)
            .collect(Collectors.toList());
    }
    public List<OrderSummaryDTO> fetchSummariesByDeptAndDate(
        Integer deptId, LocalDate from, LocalDate to) {
        return summaryRepo.findByDepartmentIdAndDateBetween(deptId, from, to).stream()
            .map(mapper::toDto)
            .collect(Collectors.toList());
    }
    

    // every midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void aggregateYesterday() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime start = yesterday.atStartOfDay();
        LocalDateTime end = start.plusDays(1);

        orderRepo.findAll().stream()
            .filter(o -> {
                var ca = o.getCreatedAt();
                return !ca.isBefore(start) && ca.isBefore(end);
            })
            .collect(Collectors.groupingBy(o -> o.getDepartment().getDepartmentId()))
            .entrySet().stream()
            .map(e -> {
                var list = e.getValue();
                int tot = list.size();
                int ap = (int) list.stream().filter(o->o.getStatus()==OrderStatus.approved).count();
                int rj = (int) list.stream().filter(o->o.getStatus()==OrderStatus.rejected).count();
                int pd = tot - ap - rj;
                return summaryRepo.findByDepartmentIdAndDate(e.getKey(), yesterday)
                        .map(s -> {
                            s.setTotalOrders(tot);
                            s.setApprovedCount(ap);
                            s.setRejectedCount(rj);
                            s.setPendingCount(pd);
                            return summaryRepo.save(s);
                        })
                        .orElseGet(() -> summaryRepo.save(
                            OrderSummary.builder()
                                .departmentId(e.getKey())
                                .date(yesterday)
                                .totalOrders(tot)
                                .approvedCount(ap)
                                .rejectedCount(rj)
                                .pendingCount(pd)
                                .build()
                        ));
            }).collect(Collectors.toList());
        // optionally broadcast summary
    }
    public void aggregateRange(LocalDate from, LocalDate to) {
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            // đánh dấu ngày này là final
            LocalDate currentDate = d;
    
            LocalDateTime start = currentDate.atStartOfDay();
            LocalDateTime end   = start.plusDays(1);
    
            List<Order> list = orderRepo.findByCreatedAtBetween(start, end);
            Map<Integer,List<Order>> departmentOrders = list.stream()
                .collect(Collectors.groupingBy(o -> o.getDepartment().getDepartmentId()));
    
            departmentOrders.forEach((deptId, orders) -> {
                int tot = orders.size();
                int ap  = (int) orders.stream()
                               .filter(o->o.getStatus()==OrderStatus.approved).count();
                int rj  = (int) orders.stream()
                               .filter(o->o.getStatus()==OrderStatus.rejected).count();
                int pd  = tot - ap - rj;
    
                summaryRepo.findByDepartmentIdAndDate(deptId, currentDate)
                    .map(s -> {
                        s.setTotalOrders(tot);
                        s.setApprovedCount(ap);
                        s.setRejectedCount(rj);
                        s.setPendingCount(pd);
                        return summaryRepo.save(s);
                    })
                    .orElseGet(() -> summaryRepo.save(
                        OrderSummary.builder()
                           .departmentId(deptId)
                           .date(currentDate)
                           .totalOrders(tot)
                           .approvedCount(ap)
                           .rejectedCount(rj)
                           .pendingCount(pd)
                           .build()
                    ));
            });
        }
    }
    public List<OrderSummaryDTO> fetchSummariesDynamic(
        Integer deptId, LocalDate from, LocalDate to) {
  
      // 1) Lấy tất cả orders trong khoảng
      LocalDateTime start = from.atStartOfDay();
      LocalDateTime end   = to.plusDays(1).atStartOfDay();
      List<Order> orders = orderRepo.findByCreatedAtBetween(start, end);
  
      // 2) Group theo deptId và date
      return orders.stream()
        .filter(o -> deptId==null || o.getDepartment().getDepartmentId().equals(deptId))
        .collect(Collectors.groupingBy(o ->
             Map.entry(o.getDepartment().getDepartmentId(), 
                       o.getCreatedAt().toLocalDate())))
        .entrySet().stream()
        .map(e -> {
          Integer dId = e.getKey().getKey();
          LocalDate date = e.getKey().getValue();
          List<Order> list = e.getValue();
          long total = list.size();
          OrderSummaryDTO dto = new OrderSummaryDTO();
          dto.setOrderId(null);
          dto.setDepartmentName("Department " + dId); // You might want to fetch actual department name
          dto.setItemCount((int)total);
          dto.setCreatedAt(date.atStartOfDay());
          dto.setUpdatedAt(date.atStartOfDay());
          return dto;
        })
        .collect(Collectors.toList());
    }
    
}