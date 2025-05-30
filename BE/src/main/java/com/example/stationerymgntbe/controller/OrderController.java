package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.entity.Order;
import com.example.stationerymgntbe.mapper.OrderMapper;
import com.example.stationerymgntbe.service.OrderService;
import com.example.stationerymgntbe.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService          orderService;
    private final UserService           userService;
    private final SimpMessagingTemplate broker;
    private final OrderMapper           orderMapper;

    /* ──────────── CRUD & QUERY ──────────── */

    @GetMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getAll() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/mine")
public Page<OrderDTO> myOrders(@PageableDefault(size = 20) Pageable pg){
    return orderService.findByCreator(userService.getCurrentUser().getId(), pg);
}


    @GetMapping("/{id}/items")
    public ResponseEntity<List<OrderItemDTO>> items(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.getOrderItems(id));
    }

    @PostMapping
    public ResponseEntity<OrderDTO> create(@RequestBody OrderInput input) {
        return ResponseEntity.ok(orderService.createOrder(input));
    }

    /* ──────────── WINDOW ──────────── */

    @PostMapping("/order-window/toggle") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String,Boolean>> toggleWindow() {
        boolean open = orderService.toggleWindow();
        broker.convertAndSend("/topic/order-window", Map.of("open", open));
        return ResponseEntity.ok(Map.of("open", open));
    }

    @GetMapping("/order-window/status")
    public ResponseEntity<Map<String,Boolean>> windowStatus() {
        return ResponseEntity.ok(Map.of("open", orderService.isWindowOpen()));
    }
    @GetMapping("/check-period")
    public ResponseEntity<Map<String, Boolean>> checkOrderPeriod() {
        return ResponseEntity.ok(orderService.checkOrderPeriod());
    }
    /* ──────────── ADMIN ACTIONS ──────────── */

    @PutMapping("/{id}/comment") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateComment(@PathVariable Integer id,
                                                  @RequestBody Map<String,String> body){
        OrderDTO dto = orderService.updateComment(id, body.get("adminComment"));
        broker.convertAndSend("/topic/orders/admin", dto);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/approve")  @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> approve(@PathVariable Integer id,
                                            @RequestBody(required=false) Map<String,String> b){
        return ResponseEntity.ok(orderService.approveOrder(id, b!=null?b.get("adminComment"):null));
    }

    @PutMapping("/{id}/reject")   @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> reject (@PathVariable Integer id,
                                            @RequestParam String comment){
        return ResponseEntity.ok(orderService.rejectOrder(id, comment));
    }

    /* ──────────── USER FLOW ──────────── */

    /* B1 – export PDF (chuyển pending → exported) */
    @PostMapping("/{id}/export")
    public ResponseEntity<byte[]> export(@PathVariable Integer id) throws IOException{
    byte[] pdf = orderService.exportPdf(id);
    return ResponseEntity.ok()
          .contentType(MediaType.APPLICATION_PDF)
          .header(HttpHeaders.CONTENT_DISPOSITION,
                 "attachment; filename=order-"+id+".pdf")
          .body(pdf);
}

    /* B2 – upload PDF đã ký + confirm (exported → submitted) */
    @PutMapping(value="/{id}/submit-signed",
                consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OrderDTO> submit(@PathVariable Integer id,
                                           @RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(orderService.markAsSubmitted(id, file));
    }

    /* B3 – tải lại file đã upload (nếu admin muốn xem) */
    @GetMapping("/{id}/signed-file")
    public ResponseEntity<ByteArrayResource> download(@PathVariable Integer id) throws IOException {
        Order o = orderService.findById(id);
        if (o.getSignedPdfPath() == null) return ResponseEntity.notFound().build();

        Path path = Paths.get(o.getSignedPdfPath());
        ByteArrayResource res = new ByteArrayResource(Files.readAllBytes(path));

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"order-" + id + ".pdf\"")
                .body(res);
    }

    /* ──────────── REPORT / DASHBOARD ──────────── */

    @GetMapping("/pending")  public ResponseEntity<List<OrderDTO>> pending  (){return ResponseEntity.ok(orderService.getPendingOrders());}
    @GetMapping("/submitted")@PreAuthorize("hasRole('ADMIN')") public ResponseEntity<List<OrderDTO>> submitted(){return ResponseEntity.ok(orderService.getSubmittedOrders());}

    @GetMapping("/pending-count")   public ResponseEntity<Map<String,Integer>> pendingCount(){return ResponseEntity.ok(Map.of("count", orderService.getPendingOrdersCount()));}
    @GetMapping("/monthly-count")   public ResponseEntity<Integer> monthlyCount(){LocalDate n=LocalDate.now();return ResponseEntity.ok(orderService.getMonthlyOrdersCount(n.getYear(),n.getMonthValue()));}
    @GetMapping("/latest")          public ResponseEntity<OrderDTO> latest(Principal p){return ResponseEntity.ok(orderService.getLatestOrder(userService.getCurrentUser().getDepartmentId()));}

    @GetMapping("/reports/products") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductOrderSummaryDTO>> topProducts(@RequestParam(defaultValue="5") int top){
        return ResponseEntity.ok(orderService.getTopOrderedProducts(top));
    }

    @GetMapping("/reports") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> report(@RequestParam Integer month,@RequestParam Integer year){
        return ResponseEntity.ok(orderService.getOrdersByMonthAndYear(month, year));
    }
    
    
}
