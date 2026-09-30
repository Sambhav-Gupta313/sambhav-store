package com.sambhav.ecom_app.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenStore {

    private final Map<String, Instant> revokedAccessTokens =
            new ConcurrentHashMap<>();

    private final Map<String, RefreshTokenData> refreshTokens =
            new ConcurrentHashMap<>();

    public void revokeAccessToken(String jti, Instant expiry) {
        revokedAccessTokens.put(jti, expiry);
    }

    public boolean isAccessTokenRevoked(String jti) {
        Instant expiry = revokedAccessTokens.get(jti);

        if (expiry == null) {
            return false;
        }

        if (expiry.isBefore(Instant.now())) {
            revokedAccessTokens.remove(jti);
            return false;
        }

        return true;
    }

    public void saveRefreshToken(
            String tokenHash,
            RefreshTokenData data) {

        refreshTokens.put(tokenHash, data);
    }

    public RefreshTokenData getRefreshToken(String tokenHash) {
        return refreshTokens.get(tokenHash);
    }

    public void revokeRefreshToken(String tokenHash) {
        refreshTokens.remove(tokenHash);
    }

    public static class RefreshTokenData {

        private final String userEmail;
        private final Instant createdAt;
        private final Instant lastUsedAt;
        private final Instant absoluteExpiry;

        public RefreshTokenData(
                String userEmail,
                Instant createdAt,
                Instant lastUsedAt,
                Instant absoluteExpiry) {

            this.userEmail = userEmail;
            this.createdAt = createdAt;
            this.lastUsedAt = lastUsedAt;
            this.absoluteExpiry = absoluteExpiry;
        }

        public String getUserEmail() {
            return userEmail;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public Instant getLastUsedAt() {
            return lastUsedAt;
        }

        public Instant getAbsoluteExpiry() {
            return absoluteExpiry;
        }
    }
}