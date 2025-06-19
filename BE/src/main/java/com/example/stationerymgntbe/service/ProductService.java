package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.ProductDTO;
import com.example.stationerymgntbe.dto.ProductStatsDTO;
import com.example.stationerymgntbe.entity.*;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.mapper.ProductMapper;
import com.example.stationerymgntbe.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service 
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;
    private final UnitRepository unitRepo;
    private final ProductMapper map;
    
    @PersistenceContext
    private EntityManager entityManager;

    /* ========== EXISTING METHODS ========== */
    
    @Transactional
    public List<ProductDTO> getAllProducts() {
        return repo.findAllWithUnitAndCategory().stream().map(map::toDto).toList();
    }

    @Transactional
    public List<ProductDTO> listAll() {
        return getAllProducts();
    }

    public Page<ProductDTO> list(Pageable pageable, Integer categoryId) {
        if (categoryId != null) {
            return repo.findByCategoryCategoryId(categoryId, pageable).map(map::toDto);
        }
        return repo.findAll(pageable).map(map::toDto);
    }

    public ProductDTO getProductById(Integer id) {
        return map.toDto(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id)));
    }

    public ProductDTO getById(Integer id) {
        return getProductById(id);
    }

    @Transactional
    public ProductDTO add(ProductDTO d) {
        if (repo.existsByCode(d.getCode()))
            throw new IllegalStateException("Product code duplicated");

        Unit u = unitRepo.findByNameVnIgnoreCase(d.getUnit())
                .or(() -> unitRepo.findByNameEnIgnoreCase(d.getUnit()))
                .orElseThrow(() -> new ResourceNotFoundException("Unit " + d.getUnit()));

        Product p = map.toEntity(d);
        p.setUnit(u);
        p = repo.save(p);

        return map.toDto(p);
    }

    @Transactional
    public ProductDTO update(Integer id, ProductDTO d) {
        Product p = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id));

        if (!p.getCode().equalsIgnoreCase(d.getCode())
                && repo.existsByCode(d.getCode()))
            throw new IllegalStateException("Product code duplicated");

        p.setCode(d.getCode());
        p.setName(d.getName());

        Unit u = unitRepo.findByNameVnIgnoreCase(d.getUnit())
                .or(() -> unitRepo.findByNameEnIgnoreCase(d.getUnit()))
                .orElseThrow(() -> new ResourceNotFoundException("Unit " + d.getUnit()));

        p.setUnit(u);

        return map.toDto(repo.save(p));
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }

    public List<ProductDTO> byCategory(Integer cid) {
        return repo.findByCategoryCategoryId(cid).stream()
                .map(map::toDto).collect(Collectors.toList());
    }

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public ProductDTO uploadImage(Integer id, MultipartFile file) throws IOException {
        Product p = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id));

        /* --- VALIDATION --- */
        if (file.isEmpty()) throw new IllegalStateException("Empty file");

        if (!file.getContentType().startsWith("image/"))
            throw new IllegalStateException("Only image files allowed");

        if (file.getSize() > 5 * 1024 * 1024) // 5 MB
            throw new IllegalStateException("File too large (>5MB)");

        /* --- SAVE --- */
        Path dir = Paths.get(uploadDir, "product-img");
        Files.createDirectories(dir);

        String ext = Optional.ofNullable(file.getOriginalFilename())
                .filter(f -> f.contains("."))
                .map(f -> f.substring(f.lastIndexOf('.')))
                .orElse("");

        String fn = id + ext; // ví dụ: 12.jpg
        Path path = dir.resolve(fn);

        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        p.setImage(fn);

        return map.toDto(repo.save(p));
    }

    /* ========== DASHBOARD METHODS ========== */

    /**
     * Get product statistics and insights
     */
    public ProductStatsDTO getProductStats() {
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        
        Long totalProducts = repo.count();
        Long totalCategories = repo.countDistinctCategories();
        Long productsOrderedThisMonth = getDistinctProductsOrderedInMonth(startOfMonth, endOfMonth);
        
        // Get most ordered product this month
        Map<String, Object> mostOrderedProduct = getMostOrderedProductInMonth(startOfMonth, endOfMonth);
        
        Long mostOrderedProductId = mostOrderedProduct != null ? (Long) mostOrderedProduct.get("productId") : null;
        String mostOrderedProductName = mostOrderedProduct != null ? (String) mostOrderedProduct.get("productName") : "N/A";
        Long mostOrderedProductCount = mostOrderedProduct != null ? (Long) mostOrderedProduct.get("orderCount") : 0L;
        
        return new ProductStatsDTO(totalProducts, totalCategories, productsOrderedThisMonth,
                                  mostOrderedProductId, mostOrderedProductName, mostOrderedProductCount);
    }

    /**
     * Get most ordered products this month
     */
    public List<Map<String, Object>> getTopOrderedProducts(int limit) {
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        
        return getTopOrderedProductsInMonth(startOfMonth, endOfMonth, limit);
    }

    /**
     * Get product category distribution in orders
     */
    public Map<String, Long> getProductCategoryDistribution() {
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        
        List<Map<String, Object>> categoryData = getCategoryDistributionInMonth(startOfMonth, endOfMonth);
        
        Map<String, Long> distribution = new HashMap<>();
        for (Map<String, Object> data : categoryData) {
            String category = (String) data.get("category");
            Long count = (Long) data.get("count");
            distribution.put(category, count);
        }
        
        return distribution;
    }

    // Helper methods that use native queries
    private Long getDistinctProductsOrderedInMonth(LocalDateTime start, LocalDateTime end) {
        String query = """
            SELECT COUNT(DISTINCT oi.product_id) 
            FROM order_items oi 
            JOIN orders o ON oi.order_id = o.order_id 
            WHERE o.created_at BETWEEN ? AND ?
            """;
        
        Object result = entityManager.createNativeQuery(query)
                .setParameter(1, start)
                .setParameter(2, end)
                .getSingleResult();
        
        return ((Number) result).longValue();
    }

    private Map<String, Object> getMostOrderedProductInMonth(LocalDateTime start, LocalDateTime end) {
        String query = """
            SELECT p.product_id as productId, p.name as productName, SUM(oi.quantity) as orderCount 
            FROM order_items oi 
            JOIN orders o ON oi.order_id = o.order_id 
            JOIN products p ON oi.product_id = p.product_id 
            WHERE o.created_at BETWEEN ? AND ? 
            GROUP BY p.product_id, p.name 
            ORDER BY orderCount DESC 
            LIMIT 1
            """;
        
        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery(query)
                .setParameter(1, start)
                .setParameter(2, end)
                .getResultList();
        
        if (results.isEmpty()) {
            return null;
        }
        
        Object[] result = results.get(0);
        Map<String, Object> productData = new HashMap<>();
        productData.put("productId", ((Number) result[0]).longValue());
        productData.put("productName", (String) result[1]);
        productData.put("orderCount", ((Number) result[2]).longValue());
        
        return productData;
    }

    private List<Map<String, Object>> getTopOrderedProductsInMonth(LocalDateTime start, LocalDateTime end, int limit) {
        String query = """
            SELECT p.product_id as productId, p.name as productName, p.code as productCode, 
                   c.name_vn as category, SUM(oi.quantity) as totalQuantity, COUNT(oi.order_item_id) as orderCount 
            FROM order_items oi 
            JOIN orders o ON oi.order_id = o.order_id 
            JOIN products p ON oi.product_id = p.product_id 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            WHERE o.created_at BETWEEN ? AND ? 
            GROUP BY p.product_id, p.name, p.code, c.name_vn 
            ORDER BY totalQuantity DESC 
            LIMIT ?
            """;
        
        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery(query)
                .setParameter(1, start)
                .setParameter(2, end)
                .setParameter(3, limit)
                .getResultList();
        
        return results.stream().map(result -> {
            Map<String, Object> productData = new HashMap<>();
            productData.put("productId", ((Number) result[0]).longValue());
            productData.put("productName", (String) result[1]);
            productData.put("productCode", (String) result[2]);
            productData.put("category", (String) result[3]);
            productData.put("totalQuantity", ((Number) result[4]).longValue());
            productData.put("orderCount", ((Number) result[5]).longValue());
            return productData;
        }).toList();
    }

    private List<Map<String, Object>> getCategoryDistributionInMonth(LocalDateTime start, LocalDateTime end) {
        String query = """
            SELECT COALESCE(c.name_vn, 'Uncategorized') as category, COUNT(oi.order_item_id) as count 
            FROM order_items oi 
            JOIN orders o ON oi.order_id = o.order_id 
            JOIN products p ON oi.product_id = p.product_id 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            WHERE o.created_at BETWEEN ? AND ? 
            GROUP BY c.name_vn 
            ORDER BY count DESC
            """;
        
        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery(query)
                .setParameter(1, start)
                .setParameter(2, end)
                .getResultList();
        
        return results.stream().map(result -> {
            Map<String, Object> categoryData = new HashMap<>();
            categoryData.put("category", (String) result[0]);
            categoryData.put("count", ((Number) result[1]).longValue());
            return categoryData;
        }).toList();
    }
}