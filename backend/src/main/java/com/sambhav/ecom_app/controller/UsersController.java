package com.sambhav.ecom_app.controller;

import com.sambhav.ecom_app.model.Users;
import com.sambhav.ecom_app.service.RefreshTokenService;
import com.sambhav.ecom_app.service.UsersService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class UsersController {

    private final UsersService service;

    public UsersController(UsersService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody Users users) {

        if (users.getUserEmail() == null || users.getUserEmail().isBlank()
                || users.getUserPass() == null || users.getUserPass().isBlank()) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        Users user = service.registerUser(users);

        if (user == null) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("User already exists");
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Registration successful");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestBody Users users,
            HttpServletResponse response) {

        try {
            String accessToken = service.verify(users, response);
            return ResponseEntity.ok(accessToken);
        } catch (AuthenticationException e) {
            // Return 401 instead of exposing Spring Security's internal exception details.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Refresh token missing");
        }

        try {
            // Rotation is performed as one server-side operation so the old token
            // cannot be reused after successful rotation.
            RefreshTokenService.RotatedRefreshToken rotated =
                    service.rotateRefreshToken(refreshToken);

            String newAccessToken =
                    service.generateAccessToken(rotated.userEmail());

            ResponseCookie cookie =
                    ResponseCookie.from("refreshToken", rotated.newToken())
                            .httpOnly(true)
                            .secure(false) // Local HTTP development. Use true with HTTPS in production.
                            .sameSite("Strict")
                            .path("/")
                            .maxAge(Duration.ofHours(8))
                            .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok(newAccessToken);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Session expired");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        // Logout must remain useful even when the access JWT has already expired.
        // JWTService safely handles an invalid/expired token without breaking logout.
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            service.revokeAccessToken(authHeader.substring(7));
        }

        if (refreshToken != null && !refreshToken.isBlank()) {
            service.revokeRefreshToken(refreshToken);
        }

        ResponseCookie deleteCookie =
                ResponseCookie.from("refreshToken", "")
                        .httpOnly(true)
                        .secure(false) // Local HTTP development. Use true with HTTPS in production.
                        .sameSite("Strict")
                        .path("/")
                        .maxAge(0)
                        .build();

        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());

        return ResponseEntity.ok("Logged out successfully");
    }
}
