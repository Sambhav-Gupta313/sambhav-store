package com.sambhav.ecom_app.service;

import com.sambhav.ecom_app.security.TokenStore;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final Duration IDLE_TIMEOUT = Duration.ofMinutes(30);
    private static final Duration ABSOLUTE_LIFETIME = Duration.ofHours(8);

    private final TokenStore tokenStore;

    public RefreshTokenService(TokenStore tokenStore) {
        this.tokenStore = tokenStore;
    }

    public String createRefreshToken(String userEmail) {
        String refreshToken = generateRawToken();
        Instant now = Instant.now();

        TokenStore.RefreshTokenData data =
                new TokenStore.RefreshTokenData(
                        userEmail,
                        now,
                        now,
                        now.plus(ABSOLUTE_LIFETIME)
                );

        tokenStore.saveRefreshToken(hash(refreshToken), data);
        return refreshToken;
    }

    /*
     * Only one thread in this application instance can rotate a refresh token
     * at a time. This complements the frontend's single-flight refresh logic
     * and prevents two requests from successfully rotating the same token.
     */
    public synchronized RotatedRefreshToken rotateRefreshToken(String oldToken) {
        String oldHash = hash(oldToken);

        TokenStore.RefreshTokenData data =
                tokenStore.getRefreshToken(oldHash);

        if (data == null) {
            throw new RuntimeException("Invalid refresh token");
        }

        Instant now = Instant.now();

        if (!data.getAbsoluteExpiry().isAfter(now)) {
            tokenStore.revokeRefreshToken(oldHash);
            throw new RuntimeException("Session expired");
        }

        if (!data.getLastUsedAt().plus(IDLE_TIMEOUT).isAfter(now)) {
            tokenStore.revokeRefreshToken(oldHash);
            throw new RuntimeException("Session idle timeout");
        }

        // Revoke first so the same refresh token cannot be reused.
        tokenStore.revokeRefreshToken(oldHash);

        String newToken = generateRawToken();

        TokenStore.RefreshTokenData newData =
                new TokenStore.RefreshTokenData(
                        data.getUserEmail(),
                        data.getCreatedAt(),
                        now,
                        data.getAbsoluteExpiry()
                );

        tokenStore.saveRefreshToken(hash(newToken), newData);

        return new RotatedRefreshToken(newToken, data.getUserEmail());
    }

    public void revokeRefreshToken(String refreshToken) {
        tokenStore.revokeRefreshToken(hash(refreshToken));
    }

    private String generateRawToken() {
        return UUID.randomUUID() + UUID.randomUUID().toString();
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            value.getBytes(StandardCharsets.UTF_8)
                    );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }

    public record RotatedRefreshToken(String newToken, String userEmail) {
    }
}
