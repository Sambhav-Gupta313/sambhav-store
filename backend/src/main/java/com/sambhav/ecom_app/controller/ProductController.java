package com.sambhav.ecom_app.controller;

import com.sambhav.ecom_app.model.Product;
import com.sambhav.ecom_app.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
@RestController
@RequestMapping("/api")
public class ProductController {
    private  final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }


    @GetMapping("/products")
    public ResponseEntity<List<Product>> getALLProducts(){
        System.out.println(">>> GET /api/products HIT");
        return new ResponseEntity<>(service.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Product> getProduct(@PathVariable int productId){
        Product prod = service.getProduct(productId);
        if (prod!=null){
            return new ResponseEntity<>(service.getProduct(productId),HttpStatus.OK);
        }
        else
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/product")
    public ResponseEntity<?>  addProduct(@RequestPart("product") Product product,
                                        @RequestPart("imageFile") MultipartFile imageFile){

        try {
        Product prod = service.addProduct(product,imageFile);
        return new ResponseEntity<>(prod,HttpStatus.CREATED);
      }catch (Exception e){
          return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
      }
    }
    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable int productId){
        Product product = service.getProduct(productId);
        byte[] imageFile = product.getImageData();

        return ResponseEntity.ok().
                contentType(MediaType.valueOf(product.getImageType()))
                .body(imageFile);
    }
    @PutMapping("/product/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable int id,@RequestPart("product") Product product,
                                                @RequestPart(value = "imageFile", required = false) MultipartFile imageFile){
         Product prod = null;
         try {
             prod = service.putProduct(id, product, imageFile);
         } catch (IOException | IllegalArgumentException e) {
             return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
         }
         if (prod!=null){
            return new ResponseEntity<>("Product updated",HttpStatus.OK);
        }
        else
            return new ResponseEntity<>("Failed to update product", HttpStatus.NOT_FOUND);
    }
    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id){
        if (service.deleteProduct(id)!=null){
            return new ResponseEntity<>("Deleted",HttpStatus.OK);
        }
        else
            return new ResponseEntity<>("Product not found",HttpStatus.NOT_FOUND);
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProduct(@RequestParam String keyword){
        System.out.println("with "+ keyword);
        List<Product> products = service.searchProduct(keyword);
        return new ResponseEntity<>(products,HttpStatus.OK);
    }
}
