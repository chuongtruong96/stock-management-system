package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.OrderDTO;
// import com.example.stationerymgntbe.dto.OrderItemDTO;
import com.example.stationerymgntbe.dto.ProductDTO;
import com.example.stationerymgntbe.dto.UserResponseDTO;
import com.example.stationerymgntbe.service.OrderService;
import com.example.stationerymgntbe.service.ProductService;
import com.example.stationerymgntbe.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping("/products")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ProductDTO> addProduct(@RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.addProduct(productDTO));
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Integer id, @RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.updateProduct(id, productDTO));
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<String> deleteProduct(@PathVariable Integer id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok("Product deleted successfully.");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Cannot delete product because it is referenced by existing order items. Please remove related order items first.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while deleting the product: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ProductDTO> updateStock(@PathVariable Integer id, @RequestBody Map<String, Integer> request) {
        return ResponseEntity.ok(productService.updateStock(id, request.get("stock")));
    }

    @GetMapping("/orders/history")
    public ResponseEntity<List<OrderDTO>> getOrderHistory(Principal principal) {
        UserResponseDTO userResponseDTO = userService.getCurrentUser();
        Integer departmentId = userResponseDTO.getEmployee().getDepartment().getDepartmentId();
        return ResponseEntity.ok(orderService.getOrdersByDepartment(departmentId));
    }

    // @GetMapping("/{orderId}/order-items")
    // public ResponseEntity<List<OrderItemDTO>> getOrderItems(@PathVariable Integer id) {
    //     return ResponseEntity.ok(orderService.getOrderItems(id));
    // }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<ProductDTO>> getLowStockProducts() {
        return ResponseEntity.ok(productService.getLowStockProducts());
    }
}

class UpdateStockRequest {
    private Integer stock;

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
}