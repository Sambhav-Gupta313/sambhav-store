# Sambhav Store

A backend-focused e-commerce application built with **Java and Spring Boot**, with a React frontend integrated to consume and demonstrate the backend REST APIs.

## Project Overview

Sambhav Store is an e-commerce backend application that provides:

* User registration and authentication
* JWT-based access-token authentication
* Refresh-token based session renewal
* Secure password hashing using BCrypt
* Product CRUD operations
* Product search
* Product image upload and retrieval
* PostgreSQL database integration
* Spring Security based request protection
* CORS configuration for frontend integration
* CSRF configuration
* Access-token revocation
* Refresh-token rotation

The React frontend is integrated with the backend APIs to demonstrate and use the backend functionality.

## My Contribution

**Primary development work: Java/Spring Boot backend**

I developed the backend functionality including:

* REST API development
* Business logic
* Database integration
* Product management
* User registration and authentication
* JWT authentication
* Refresh-token mechanism
* Password encryption using BCrypt
* Spring Security configuration
* CORS and CSRF configuration
* Product image handling
* Token revocation and refresh-token rotation

The frontend was integrated with the backend APIs to demonstrate the application.

## Architecture

```text
Integrated React Frontend
          |
          | HTTP / REST APIs
          v
+-------------------------+
| Spring Security         |
| JwtFilter               |
+------------+------------+
             |
             v
+-------------------------+
| Controllers             |
|                         |
| ProductController       |
| UsersController         |
+------------+------------+
             |
             v
+-------------------------+
| Services                |
|                         |
| ProductService          |
| UsersService            |
| JWTService              |
| RefreshTokenService     |
| MyUserDetailsService    |
+------------+------------+
             |
             v
+-------------------------+
| Repositories            |
|                         |
| ProductRepository       |
| UsersRepository         |
+------------+------------+
             |
             v
       PostgreSQL
```

## Backend Package Structure

```text
src/main/java/com/sambhav/ecom_app

├── configuration
│   └── SecurityConfig.java
│
├── controller
│   ├── ProductController.java
│   └── UsersController.java
│
├── filter
│   └── JwtFilter.java
│
├── model
│   ├── Product.java
│   ├── Users.java
│   └── UserPrincipal.java
│
├── repository
│   ├── ProductRepository.java
│   └── UsersRepository.java
│
├── security
│   └── TokenStore.java
│
└── service
    ├── JWTService.java
    ├── MyUserDetailsService.java
    ├── ProductService.java
    ├── RefreshTokenService.java
    └── UsersService.java
```

## Tech Stack

### Backend

* Java
* Spring Boot
* Spring Web
* Spring Security
* Spring Data JPA
* Hibernate
* PostgreSQL
* JWT
* BCrypt
* Maven

### Frontend Integration

* React
* Vite
* Axios

The frontend is used as an integrated client for consuming the backend APIs.

## Authentication

The application uses JWT-based authentication with separate access and refresh tokens.

### Login Flow

```text
User Login
    |
    v
AuthenticationManager
    |
    v
DaoAuthenticationProvider
    |
    v
MyUserDetailsService
    |
    v
UsersRepository
    |
    v
BCrypt Password Verification
    |
    +-------------------+
    |                   |
    v                   v
Access JWT        Refresh Token
15 minutes        HttpOnly Cookie
```

### Access Token

* JWT-based
* Valid for 15 minutes
* Sent using the `Authorization: Bearer <token>` header
* Contains the user's email as the subject
* Contains a unique JWT ID (`jti`)
* Revocation is supported through the token store
* JWTs are not logged by the backend

### Refresh Token

* Stored in the browser as an HttpOnly cookie
* Raw refresh token is not stored server-side
* Server stores a SHA-256 hash of the refresh token
* Idle timeout: 30 minutes
* Absolute session lifetime: 8 hours
* Refresh tokens are rotated after successful refresh
* The previous refresh token is revoked before the new token is stored

## Security

Spring Security is configured with:

* BCrypt password hashing
* JWT authentication
* Stateless session management
* Custom JWT filter
* AuthenticationManager
* DaoAuthenticationProvider
* CORS configuration
* CSRF configuration
* Unauthorized requests return HTTP 401
* Access-token revocation
* Refresh-token rotation
* HttpOnly refresh-token cookie

Invalid or expired JWTs are treated as unauthenticated requests rather than exposing token details.

## CORS

The backend is configured to allow the local React frontend:

```text
http://localhost:5173
```

Credentials are enabled because authentication uses cookies for refresh tokens.

For production deployment, the allowed frontend origin must be changed to the deployed HTTPS frontend URL.

## CSRF

The application uses Spring Security's `CookieCsrfTokenRepository`.

The frontend can receive the CSRF token through the `XSRF-TOKEN` cookie and send it using the `X-XSRF-TOKEN` header for protected state-changing requests.

Authentication endpoints and the JWT-protected product API routes are configured according to the application's token-based authentication flow.

## Product APIs

| Method | Endpoint                           | Purpose           |
| ------ | ---------------------------------- | ----------------- |
| GET    | `/api/products`                    | Get all products  |
| GET    | `/api/product/{id}`                | Get product by ID |
| GET    | `/api/product/{id}/image`          | Get product image |
| GET    | `/api/products/search?keyword=...` | Search products   |
| POST   | `/api/product`                     | Add a product     |
| PUT    | `/api/product/{id}`                | Update a product  |
| DELETE | `/api/product/{id}`                | Delete a product  |

### Product Image Upload

Product creation/update uses multipart form data.

```text
product    → Product JSON
imageFile  → Image file
```

Product image information is stored with the product:

```text
imageName
imageType
imageData
```

## Authentication APIs

| Method | Endpoint             | Purpose                                |
| ------ | -------------------- | -------------------------------------- |
| POST   | `/api/auth/register` | Register a new user                    |
| POST   | `/api/auth/login`    | Authenticate user                      |
| POST   | `/api/auth/refresh`  | Generate a new access token            |
| POST   | `/api/auth/logout`   | Revoke tokens and clear refresh cookie |

## Database

The backend uses **PostgreSQL** with **Spring Data JPA/Hibernate**.

Repositories extend `JpaRepository` to provide standard CRUD operations.

### Product Search

A custom JPQL query searches products by:

* Name
* Description
* Brand
* Category

The search is case-insensitive.

## Environment Variables

Sensitive configuration is not hard-coded in the source code.

The backend uses:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
```

Example:

```text
DB_URL=jdbc:postgresql://localhost:5432/ecom
DB_USERNAME=postgres
DB_PASSWORD=your_database_password
JWT_SECRET=your_base64_encoded_secret
```

**Never commit real passwords or JWT secrets to GitHub.**

## Local Backend Setup

### 1. Configure PostgreSQL

Create the required PostgreSQL database.

### 2. Set environment variables

Windows CMD:

```cmd
set DB_PASSWORD=your_postgres_password
set JWT_SECRET=your_base64_encoded_secret
```

PowerShell:

```powershell
$env:DB_PASSWORD="your_postgres_password"
$env:JWT_SECRET="your_base64_encoded_secret"
```

### 3. Run the backend

The backend runs locally on:

```text
http://localhost:8089
```

API base URL:

```text
http://localhost:8089/api
```

The backend can also be run directly from IntelliJ IDEA.

## Frontend Integration

The React frontend runs locally on:

```text
http://localhost:5173
```

It consumes the backend REST APIs for authentication and product functionality.

The frontend is an integrated client for the backend and is not the primary development focus of this project.

## Current Limitations

The supplied backend currently does not provide persistent backend endpoints for:

* Orders
* Checkout
* Payments
* Addresses
* Persistent cart storage

The integrated frontend therefore does not pretend that a checkout/order was successfully stored when the corresponding backend functionality is unavailable.

## Project Structure

```text
sambhav-store/
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── README.md
└── .gitignore
```

## Deployment

Production deployment will include:

```text
React Frontend
      |
      v
Live Spring Boot Backend
      |
      v
Cloud PostgreSQL Database
```

Production configuration will use environment variables for sensitive values and HTTPS for secure cookie handling.

### Live Demo

```text
Frontend: Coming soon
Backend API: Coming soon
GitHub: Coming soon
```

## Future Improvements

Potential future backend improvements include:

* Order management
* Persistent shopping cart
* Address management
* Payment integration
* API documentation with OpenAPI/Swagger
* Automated unit and integration testing
* Production monitoring and logging
* Role-based authorization
