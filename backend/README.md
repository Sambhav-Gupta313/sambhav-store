# Sambhav Store - Spring Boot Backend

Backend for the Sambhav Store e-commerce application.

## Run

Backend runs on:

`http://localhost:8089`

API base URL:

`http://localhost:8089/api`

Before starting the application, set the database password and JWT secret.

### Windows CMD

```cmd
set DB_PASSWORD=your_postgres_password
set JWT_SECRET=your_base64_encoded_secret
mvnw.cmd spring-boot:run
```

For PowerShell use `$env:DB_PASSWORD="..."` and `$env:JWT_SECRET="..."`.

## Authentication Architecture

```text
Login
  ↓
Access JWT returned to frontend
  ↓
Access JWT stored ONLY in browser memory
  ↓
Authorization: Bearer <JWT>
  ↓
JWT expires after 15 minutes
  ↓
POST /api/auth/refresh
  ↓
HttpOnly refresh cookie is sent automatically by the browser
  ↓
Refresh token is rotated
  ↓
New access JWT
```

### Access token

- Lifetime: 15 minutes
- Stored: frontend JavaScript memory only
- Never stored in `localStorage` or `sessionStorage`
- Never logged by the backend

### Refresh token

- Stored server-side as a SHA-256 hash
- Raw refresh token is sent to the browser only as an HttpOnly cookie
- Frontend JavaScript must never read it
- Idle timeout: 30 minutes
- Absolute session lifetime: 8 hours
- Refresh token is rotated after a successful refresh

### Proactive refresh

The frontend should calculate the JWT `exp` claim and request a new access token approximately one minute before expiration. The frontend-decoded claim is used only for scheduling; the backend remains responsible for validating JWTs.

### CSRF

Spring Security uses `CookieCsrfTokenRepository` and the `XSRF-TOKEN` cookie for CSRF protection on protected state-changing requests. The refresh token is a separate HttpOnly cookie.

### Authentication endpoints

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Product endpoints

```text
GET    /api/products
GET    /api/product/{id}
GET    /api/product/{id}/image
POST   /api/product
PUT    /api/product/{id}
DELETE /api/product/{id}
GET    /api/products/search?keyword=...
```

Protected product requests should send the access JWT.

## Important security notes

- Do not commit `DB_PASSWORD` or `JWT_SECRET`.
- Do not print JWTs or refresh tokens in logs.
- Local development uses `Secure=false` for the refresh cookie because the application runs over HTTP. Use HTTPS and `Secure=true` in production.
- CORS is configured centrally in `SecurityConfig`.
