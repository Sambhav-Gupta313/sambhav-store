package com.sambhav.ecom_app.service;

import com.sambhav.ecom_app.model.Users;
import com.sambhav.ecom_app.repository.UsersRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class UsersService {

    private final RefreshTokenService refreshTokenService;
    private final JWTService jwtService;
    private final UsersRepository repo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;

    public UsersService(
            RefreshTokenService refreshTokenService,
            JWTService jwtService,
            UsersRepository repo,
            PasswordEncoder encoder,
            AuthenticationManager authManager) {
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
        this.repo = repo;
        this.encoder = encoder;
        this.authManager = authManager;
    }

    public Users registerUser(Users users) {
        if (repo.findByUserEmail(users.getUserEmail()) != null) {
            return null;
        }

        users.setUserPass(encoder.encode(users.getUserPass()));
        return repo.save(users);
    }

    public String verify(
            Users users,
            HttpServletResponse response) {

        Authentication authentication =
                authManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                users.getUserEmail(),
                                users.getUserPass()
                        )
                );

        if (!authentication.isAuthenticated()) {
            throw new org.springframework.security.authentication.BadCredentialsException(
                    "Invalid credentials"
            );
        }

        String accessToken =
                jwtService.generateToken(users.getUserEmail());

        String refreshToken =
                refreshTokenService.createRefreshToken(
                        users.getUserEmail()
                );

        ResponseCookie cookie =
                ResponseCookie.from("refreshToken", refreshToken)
                        .httpOnly(true)
                        .secure(false)
                        .sameSite("Strict")
                        .path("/")
                        .maxAge(Duration.ofHours(8))
                        .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return accessToken;
    }

    public String generateAccessToken(String email) {
        return jwtService.generateToken(email);
    }

    public RefreshTokenService.RotatedRefreshToken rotateRefreshToken(
            String refreshToken) {
        return refreshTokenService.rotateRefreshToken(refreshToken);
    }

    public void revokeAccessToken(String accessToken) {
        jwtService.revokeToken(accessToken);
    }

    public void revokeRefreshToken(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
    }
}
