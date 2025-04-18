package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.ProductDTO;
import com.example.stationerymgntbe.entity.Product;
import com.example.stationerymgntbe.entity.Unit;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.mapper.ProductMapper;
import com.example.stationerymgntbe.repository.ProductRepository;
import com.example.stationerymgntbe.repository.UnitRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;
    private final ProductMapper productMapper;

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return productMapper.toDto(product);
    }

    @Transactional
    public ProductDTO addProduct(ProductDTO dto) {
        Unit unit = unitRepository.findByNameVn(dto.getUnit())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with name: " + dto.getUnit()));

        // ensure Product has a @Builder annotation
        Product product = Product.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .unit(unit)
                .build();

        product = productRepository.save(product);
        return productMapper.toDto(product);
    }

    @Transactional
    public ProductDTO updateProduct(Integer id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        Unit unit = unitRepository.findByNameVn(dto.getUnit())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with name: " + dto.getUnit()));

        product.setCode(dto.getCode());
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setUnit(unit);

        return productMapper.toDto(productRepository.save(product));
    }

    public void deleteProduct(Integer id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with ID: " + id);
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public ProductDTO updateStock(Integer productId, Integer stock) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        product.setStock(stock);
        return productMapper.toDto(product);
    }

    public List<ProductDTO> getLowStockProducts() {
        return productRepository.findByStockLessThan(10).stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }
}
