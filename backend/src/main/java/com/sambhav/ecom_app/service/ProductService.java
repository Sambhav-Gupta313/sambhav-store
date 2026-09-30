package com.sambhav.ecom_app.service;

import com.sambhav.ecom_app.model.Product;
import com.sambhav.ecom_app.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public List<Product> getAllProducts() {
        return repository.findAll();
    }

    public Product getProduct(int productId) {
        return repository.findById(productId).orElse(null);
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("Product image is required");
        }
        setImage(product, imageFile);
        return repository.save(product);
    }

    public Product deleteProduct(int id) {
        Product product = repository.findById(id).orElse(null);
        if (product == null) {
            return null;
        }
        repository.delete(product);
        return product;
    }

    public Product putProduct(int id, Product product, MultipartFile imageFile) throws IOException {
        Product existing = repository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }

        product.setId(id);
        if (imageFile != null && !imageFile.isEmpty()) {
            setImage(product, imageFile);
        } else {
            product.setImageName(existing.getImageName());
            product.setImageType(existing.getImageType());
            product.setImageData(existing.getImageData());
        }
        return repository.save(product);
    }

    private void setImage(Product product, MultipartFile imageFile) throws IOException {
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setImageData(imageFile.getBytes());
    }

    public List<Product> searchProduct(String keyword) {
        return repository.searchProducts(keyword);
    }
}
