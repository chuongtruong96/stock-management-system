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

    

    @Transactional
    public List<ProductDTO> listAll() {
        return repo.findAll().stream()
                .map(map::toDto)
                .collect(Collectors.toList());
    }

    public Page<ProductDTO> list(Pageable pageable, Integer categoryId) {
        if (categoryId != null) {
            return repo.findByCategoryCategoryId(categoryId, pageable).map(map::toDto);
        }
        return repo.findAll(pageable).map(map::toDto);
    }

    public Page<ProductDTO> list(Pageable pageable, Integer categoryId, String query) {
        // If no search query, use the original method
        if (query == null || query.trim().isEmpty()) {
            return list(pageable, categoryId);
        }
        
        // Search with category filter
        if (categoryId != null) {
            return repo.findByCategoryAndNameOrCodeContainingIgnoreCase(categoryId, query.trim(), pageable)
                      .map(map::toDto);
        }
        
        // Search without category filter
        return repo.findByNameOrCodeContainingIgnoreCase(query.trim(), pageable)
                  .map(map::toDto);
    }

    public ProductDTO getProductById(Integer id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id));
        return map.toDto(product);
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
        try {
            YearMonth currentMonth = YearMonth.now();
            LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
            
            List<Map<String, Object>> result = getTopOrderedProductsInMonth(startOfMonth, endOfMonth, limit);
            
            // If no orders this month, get all-time top products
            if (result.isEmpty()) {
                return getAllTimeTopProducts(limit);
            }
            
            return result;
        } catch (Exception e) {
            // Log error and return fallback
            System.err.println("Error getting top ordered products: " + e.getMessage());
            e.printStackTrace();
            return getAllTimeTopProducts(limit);
        }
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

    /**
     * Fallback method to get all-time top products or just recent products
     */
    private List<Map<String, Object>> getAllTimeTopProducts(int limit) {
        try {
            // Try to get all-time top ordered products
            String query = """
                SELECT p.product_id as productId, p.name as productName, p.code as productCode, 
                       c.name_vn as category, u.name_vn as unit, p.image as image,
                       COALESCE(SUM(oi.quantity), 0) as totalQuantity, 
                       COALESCE(COUNT(oi.order_item_id), 0) as orderCount 
                FROM products p 
                LEFT JOIN order_items oi ON p.product_id = oi.product_id 
                LEFT JOIN orders o ON oi.order_id = o.order_id 
                LEFT JOIN categories c ON p.category_id = c.category_id 
                LEFT JOIN units u ON p.unit_id = u.unit_id 
                GROUP BY p.product_id, p.name, p.code, c.name_vn, u.name_vn, p.image 
                ORDER BY totalQuantity DESC, p.product_id ASC 
                LIMIT ?
                """;
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = entityManager.createNativeQuery(query)
                    .setParameter(1, limit)
                    .getResultList();
            
            return results.stream().map(result -> {
                Map<String, Object> productData = new HashMap<>();
                productData.put("productId", ((Number) result[0]).longValue());
                productData.put("productName", (String) result[1]);
                productData.put("productCode", (String) result[2]);
                productData.put("category", (String) result[3]);
                productData.put("unit", (String) result[4]);
                productData.put("image", (String) result[5]);
                productData.put("totalQuantity", ((Number) result[6]).longValue());
                productData.put("orderCount", ((Number) result[7]).longValue());
                return productData;
            }).toList();
            
        } catch (Exception e) {
            // Ultimate fallback: return recent products
            System.err.println("Error getting all-time top products, using recent products: " + e.getMessage());
            return getRecentProducts(limit);
        }
    }

    /**
     * Ultimate fallback: get recent products
     */
    private List<Map<String, Object>> getRecentProducts(int limit) {
        try {
            List<ProductDTO> products = listAll();
            return products.stream()
                    .limit(limit)
                    .map(product -> {
                        Map<String, Object> productData = new HashMap<>();
                        productData.put("productId", product.getId().longValue());
                        productData.put("productName", product.getName());
                        productData.put("productCode", product.getCode());
                        productData.put("category", "Uncategorized");
                        productData.put("unit", product.getUnit());
                        productData.put("image", product.getImage());
                        productData.put("totalQuantity", 0L);
                        productData.put("orderCount", 0L);
                        return productData;
                    })
                    .toList();
        } catch (Exception e) {
            System.err.println("Error getting recent products: " + e.getMessage());
            return new ArrayList<>();
        }
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
                   c.name_vn as category, u.name_vn as unit, p.image as image,
                   SUM(oi.quantity) as totalQuantity, COUNT(oi.order_item_id) as orderCount 
            FROM order_items oi 
            JOIN orders o ON oi.order_id = o.order_id 
            JOIN products p ON oi.product_id = p.product_id 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            LEFT JOIN units u ON p.unit_id = u.unit_id 
            WHERE o.created_at BETWEEN ? AND ? 
            GROUP BY p.product_id, p.name, p.code, c.name_vn, u.name_vn, p.image 
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
            productData.put("unit", (String) result[4]);
            productData.put("image", (String) result[5]);
            productData.put("totalQuantity", ((Number) result[6]).longValue());
            productData.put("orderCount", ((Number) result[7]).longValue());
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