package com.example.stationerymgntbe.dto;

public class ProductStatsDTO {
    private Long totalProducts;
    private Long totalCategories;
    private Long productsOrderedThisMonth;
    private Long mostOrderedProductId;
    private String mostOrderedProductName;
    private Long mostOrderedProductCount;

    // Constructors
    public ProductStatsDTO() {}

    public ProductStatsDTO(Long totalProducts, Long totalCategories, Long productsOrderedThisMonth,
                          Long mostOrderedProductId, String mostOrderedProductName, Long mostOrderedProductCount) {
        this.totalProducts = totalProducts;
        this.totalCategories = totalCategories;
        this.productsOrderedThisMonth = productsOrderedThisMonth;
        this.mostOrderedProductId = mostOrderedProductId;
        this.mostOrderedProductName = mostOrderedProductName;
        this.mostOrderedProductCount = mostOrderedProductCount;
    }

    // Getters and Setters
    public Long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public Long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(Long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public Long getProductsOrderedThisMonth() {
        return productsOrderedThisMonth;
    }

    public void setProductsOrderedThisMonth(Long productsOrderedThisMonth) {
        this.productsOrderedThisMonth = productsOrderedThisMonth;
    }

    public Long getMostOrderedProductId() {
        return mostOrderedProductId;
    }

    public void setMostOrderedProductId(Long mostOrderedProductId) {
        this.mostOrderedProductId = mostOrderedProductId;
    }

    public String getMostOrderedProductName() {
        return mostOrderedProductName;
    }

    public void setMostOrderedProductName(String mostOrderedProductName) {
        this.mostOrderedProductName = mostOrderedProductName;
    }

    public Long getMostOrderedProductCount() {
        return mostOrderedProductCount;
    }

    public void setMostOrderedProductCount(Long mostOrderedProductCount) {
        this.mostOrderedProductCount = mostOrderedProductCount;
    }
}