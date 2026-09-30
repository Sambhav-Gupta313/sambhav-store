package com.sambhav.ecom_app.service;

import com.sambhav.ecom_app.security.TokenStore;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JWTService {

    @Value("${jwt.secret}")
    private String secretkey;

    private final TokenStore tokenStore;

    public JWTService(TokenStore tokenStore) {
        this.tokenStore = tokenStore;
    }

    public String generateToken(String userEmail) {

        Map<String, Object> claims = new HashMap<>();

        return Jwts.builder()
                .claims()
                .add(claims)
                .id(UUID.randomUUID().toString())
                .subject(userEmail)
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis() + 15 * 60 * 1000
                        )
                )
                .and()
                .signWith(getKey())
                .compact();
    }

    private SecretKey getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretkey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUserEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractJti(String token) {
        return extractClaim(token, Claims::getId);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(
            String token,
            Function<Claims, T> claimResolver) {

        Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(
            String token,
            UserDetails userDetails) {

        try {
            String userEmail = extractUserEmail(token);
            String jti = extractJti(token);

            return userEmail.equals(userDetails.getUsername())
                    && !isTokenExpired(token)
                    && !tokenStore.isAccessTokenRevoked(jti);

        } catch (JwtException | IllegalArgumentException e) {

            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public void revokeToken(String token) {

        try {
            String jti = extractJti(token);
            Instant expiry = extractExpiration(token).toInstant();
            tokenStore.revokeAccessToken(jti, expiry);

        } catch (JwtException | IllegalArgumentException ignored) {

        }
    }
}
