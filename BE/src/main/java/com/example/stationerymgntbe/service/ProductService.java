package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.ProductDTO;
import com.example.stationerymgntbe.entity.Product;
import com.example.stationerymgntbe.entity.Unit;
import com.example.stationerymgntbe.mapper.ProductMapper;
import com.example.stationerymgntbe.repository.ProductRepository;
import com.example.stationerymgntbe.repository.UnitRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private UnitRepository unitRepository;  // Add this

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toProductDTO)
                .collect(Collectors.toList());
    }

    public Product getProductById(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    public ProductDTO addProduct(ProductDTO productDTO) {
        Product product = new Product();
        product.setCode(productDTO.getCode());
        product.setName(productDTO.getName());
        // Fetch the Unit entity based on the unit name
        Unit unit = unitRepository.findByNameVn(productDTO.getUnit())
                .orElseThrow(() -> new RuntimeException("Unit not found: " + productDTO.getUnit()));
        product.setUnit(unit);
        product.setStock(productDTO.getStock());
        product.setPrice(productDTO.getPrice());
        product = productRepository.save(product);
        return productMapper.toProductDTO(product);
    }

    public ProductDTO updateProduct(Integer id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        product.setCode(productDTO.getCode());
        product.setName(productDTO.getName());
        // Fetch the Unit entity based on the unit name
        Unit unit = unitRepository.findByNameVn(productDTO.getUnit())
                .orElseThrow(() -> new RuntimeException("Unit not found: " + productDTO.getUnit()));
        product.setUnit(unit);
        product.setStock(productDTO.getStock());
        product.setPrice(productDTO.getPrice());
        product = productRepository.save(product);
        return productMapper.toProductDTO(product);
    }

    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }

    @Transactional
    public ProductDTO updateStock(Integer productId, Integer stock) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        product.setStock(stock);
        productRepository.save(product);
        return productMapper.toProductDTO(product);
    }

    public List<ProductDTO> getLowStockProducts() {
        return productRepository.findByStockLessThan(10).stream()
                .map(productMapper::toProductDTO)
                .collect(Collectors.toList());
    }
}