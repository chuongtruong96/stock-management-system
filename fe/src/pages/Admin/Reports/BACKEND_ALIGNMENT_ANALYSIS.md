# Reports Page Backend Alignment Analysis

## 🔍 Current Backend Structure Analysis

### Available Entities
1. **Order** - Main order entity with status, department, created_by, admin_comment
2. **OrderItem** - Individual items in orders with product and quantity
3. **Product** - Products with code, name (VN), nameEn, unit, category
4. **Department** - Departments with name and email
5. **Unit** - Units with nameVn and nameEn
6. **Category** - Product categories
7. **User** - Users who create orders

### Available API Endpoints

#### Report Controller (`/api/reports`)
- `GET /reports?year&month` → Returns `List<ReportDTO>`
- `GET /reports/full?year&month` → Returns `MonthlyReportDTO`
- `GET /reports/export/excel?month` → Excel file
- `GET /reports/export/pdf?month` → PDF file

#### Order Repository Query
```sql
SELECT d.name AS department,
       p.code AS product_code,
       p.name AS product_name_vn,
       SUM(oi.quantity) AS qty,
       u.name_vn AS unit
FROM orders o
JOIN departments d ON d.department_id = o.department_id
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
JOIN units u ON u.unit_id = p.unit_id
WHERE o.created_at >= :start AND o.created_at < :end
GROUP BY d.name, p.code, p.name, u.name_vn
ORDER BY d.name, p.name
```

### Current DTOs

#### ReportDTO
```java
{
    Long id;
    String department;
    String productCode;
    String productNameVn;
    int quantity;
    String unit;
}
```

#### MonthlyReportDTO
```java
{
    List<OrderDTO> orders;
    List<ReportDTO> summary;
    List<ChartSeriesDTO> chart;
}
```

## 🚨 Issues with Current Frontend Implementation

### 1. **Mock Data Usage**
- Frontend uses simulated data for trends, categories, comparisons
- No real historical data for comparative analysis
- Fake department concentration analysis

### 2. **Missing Backend Endpoints**
- No endpoint for historical data comparison
- No endpoint for department statistics
- No endpoint for product popularity over time
- No endpoint for category distribution
- No endpoint for real-time updates

### 3. **Data Structure Mismatches**
- Frontend expects `productNameEn` but backend only provides `productNameVn`
- Frontend expects `createdAt` but backend provides aggregated data
- Frontend expects individual order data but gets summarized data

### 4. **Advanced Features Not Supported**
- Real-time updates require WebSocket or polling endpoints
- Advanced filtering needs backend query parameters
- Custom report builder needs dynamic query generation
- Comparative analysis needs historical data storage

## ✅ Recommended Backend Enhancements

### 1. **Enhanced Report Controller**

```java
@RestController
@RequestMapping("/api/reports")
public class ReportController {
    
    // Current endpoints (keep as-is)
    @GetMapping
    public List<ReportDTO> summary(@RequestParam int year, @RequestParam int month);
    
    @GetMapping("/full")
    public MonthlyReportDTO full(@RequestParam int year, @RequestParam int month);
    
    // NEW: Historical comparison
    @GetMapping("/comparison")
    public ComparisonReportDTO comparison(
        @RequestParam int currentYear, @RequestParam int currentMonth,
        @RequestParam int compareYear, @RequestParam int compareMonth
    );
    
    // NEW: Department statistics
    @GetMapping("/departments/stats")
    public List<DepartmentStatsDTO> departmentStats(
        @RequestParam int year, @RequestParam int month
    );
    
    // NEW: Product trends
    @GetMapping("/products/trends")
    public List<ProductTrendDTO> productTrends(
        @RequestParam int year, @RequestParam int month,
        @RequestParam(defaultValue = "6") int months
    );
    
    // NEW: Category distribution
    @GetMapping("/categories/distribution")
    public List<CategoryDistributionDTO> categoryDistribution(
        @RequestParam int year, @RequestParam int month
    );
    
    // NEW: Real-time summary
    @GetMapping("/realtime")
    public RealtimeStatsDTO realtimeStats();
}
```

### 2. **New DTOs Needed**

```java
// Enhanced ReportDTO with more fields
public class EnhancedReportDTO {
    private Long id;
    private String department;
    private String productCode;
    private String productNameVn;
    private String productNameEn; // NEW
    private String categoryName;  // NEW
    private int quantity;
    private String unit;
    private LocalDateTime createdAt; // NEW
    private String orderStatus;   // NEW
    private Integer orderId;      // NEW
}

// Comparison DTO
public class ComparisonReportDTO {
    private List<ReportDTO> current;
    private List<ReportDTO> previous;
    private ComparisonStatsDTO stats;
}

// Department statistics
public class DepartmentStatsDTO {
    private String departmentName;
    private int totalOrders;
    private int totalQuantity;
    private int uniqueProducts;
    private double averageOrderSize;
    private LocalDateTime lastOrderDate;
}

// Product trends
public class ProductTrendDTO {
    private String productCode;
    private String productName;
    private List<MonthlyQuantityDTO> monthlyData;
    private double growthRate;
}
```

### 3. **Enhanced Repository Queries**

```java
public interface OrderRepository extends JpaRepository<Order, Integer> {
    
    // Enhanced report data with more fields
    @Query(value = """
        SELECT d.name AS department,
               p.code AS product_code,
               p.name AS product_name_vn,
               p.name_en AS product_name_en,
               c.name AS category_name,
               SUM(oi.quantity) AS qty,
               u.name_vn AS unit,
               o.created_at,
               o.status,
               o.order_id
        FROM orders o
        JOIN departments d ON d.department_id = o.department_id
        JOIN order_items oi ON oi.order_id = o.order_id
        JOIN products p ON p.product_id = oi.product_id
        JOIN units u ON u.unit_id = p.unit_id
        LEFT JOIN categories c ON c.category_id = p.category_id
        WHERE o.created_at >= :start AND o.created_at < :end
        ORDER BY o.created_at DESC
        """, nativeQuery = true)
    List<Object[]> getEnhancedReportData(@Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);
    
    // Department statistics
    @Query(value = """
        SELECT d.name,
               COUNT(DISTINCT o.order_id) as total_orders,
               SUM(oi.quantity) as total_quantity,
               COUNT(DISTINCT p.product_id) as unique_products,
               AVG(order_totals.order_quantity) as avg_order_size,
               MAX(o.created_at) as last_order_date
        FROM departments d
        LEFT JOIN orders o ON o.department_id = d.department_id
        LEFT JOIN order_items oi ON oi.order_id = o.order_id
        LEFT JOIN products p ON p.product_id = oi.product_id
        LEFT JOIN (
            SELECT o2.order_id, SUM(oi2.quantity) as order_quantity
            FROM orders o2
            JOIN order_items oi2 ON oi2.order_id = o2.order_id
            WHERE o2.created_at >= :start AND o2.created_at < :end
            GROUP BY o2.order_id
        ) order_totals ON order_totals.order_id = o.order_id
        WHERE o.created_at >= :start AND o.created_at < :end
        GROUP BY d.department_id, d.name
        ORDER BY total_quantity DESC
        """, nativeQuery = true)
    List<Object[]> getDepartmentStats(@Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end);
}
```

## 🔧 Frontend Alignment Plan

### Phase 1: Remove Mock Data and Align with Current Backend

1. **Update API calls to use actual endpoints**
   ```javascript
   // Current working endpoints
   reportApi.getSummary(year, month)  // /api/reports
   reportApi.getFull(year, month)     // /api/reports/full
   reportApi.exportExcel(month)       // /api/reports/export/excel
   reportApi.exportPdf(month)         // /api/reports/export/pdf
   ```

2. **Fix data structure mapping**
   ```javascript
   // Map backend ReportDTO to frontend expected format
   const mapReportData = (backendData) => ({
     id: backendData.id,
     department: backendData.department,
     productCode: backendData.productCode,
     productNameVn: backendData.productNameVn,
     productNameEn: backendData.productNameVn, // Fallback until backend provides
     quantity: backendData.quantity,
     unit: backendData.unit,
     // Add computed fields
     createdAt: new Date().toISOString(), // Placeholder
     category: 'Unknown' // Placeholder
   });
   ```

3. **Remove simulated features**
   - Remove fake trend data generation
   - Remove mock comparative analysis
   - Remove simulated real-time updates
   - Remove fake category distribution

### Phase 2: Implement Backend Enhancements

1. **Add missing endpoints to backend**
2. **Enhance DTOs with required fields**
3. **Update repository queries**
4. **Add proper error handling**

### Phase 3: Re-enable Advanced Features

1. **Real-time updates with actual data**
2. **Comparative analysis with historical data**
3. **Advanced filtering with backend support**
4. **Custom report builder with dynamic queries**

## 🎯 Immediate Action Items

### Frontend Changes (Immediate)
1. Remove all mock data generation
2. Use only actual backend endpoints
3. Handle missing fields gracefully
4. Add proper error handling for unsupported features
5. Update column definitions to match ReportDTO

### Backend Changes (Recommended)
1. Add productNameEn to ReportDTO
2. Add category information to report query
3. Add createdAt timestamp to individual records
4. Create department statistics endpoint
5. Add historical comparison endpoint

## 📊 Data Flow Alignment

### Current Working Flow
```
Frontend Request → /api/reports?year=2024&month=12
Backend Query → OrderRepository.getReportData()
Backend Response → List<ReportDTO>
Frontend Processing → Display in table/charts
```

### Enhanced Flow (Future)
```
Frontend Request → /api/reports/enhanced?year=2024&month=12
Backend Query → OrderRepository.getEnhancedReportData()
Backend Response → EnhancedMonthlyReportDTO
Frontend Processing → Advanced analytics and visualizations
```

## 🚀 Implementation Priority

1. **High Priority**: Remove mock data, align with current backend
2. **Medium Priority**: Add missing backend endpoints
3. **Low Priority**: Advanced features with full backend support

This analysis ensures the Reports page works with the actual backend structure while providing a roadmap for future enhancements.