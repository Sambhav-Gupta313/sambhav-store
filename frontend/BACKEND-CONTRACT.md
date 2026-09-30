# Backend integration contract used by this frontend

This document records the contract extracted from the supplied `ecom-app-backend-fixed.zip`.

## Runtime
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8089`
- API base: `http://localhost:8089/api`
- Backend CORS explicitly permits `http://localhost:5173` with credentials.

## Authentication

| Method | Endpoint | Frontend behavior |
|---|---|---|
| POST | `/api/auth/register` | JSON `{ userEmail, userPass }` |
| POST | `/api/auth/login` | JSON `{ userEmail, userPass }`; receives access JWT |
| POST | `/api/auth/refresh` | Sends HttpOnly `refreshToken` cookie; receives new access JWT |
| POST | `/api/auth/logout` | Sends access JWT when available and refresh cookie automatically |

Access JWT is held only in JavaScript memory. It is never put in local/session storage.

The frontend decodes only the JWT `exp`/`sub` claims for scheduling/UI. The backend remains responsible for token validation.

## CSRF

The supplied backend uses `CookieCsrfTokenRepository` and permits auth endpoints without CSRF checks. Protected state-changing requests use the `XSRF-TOKEN` cookie as the `X-XSRF-TOKEN` header. The Axios layer reads that cookie and adds the header automatically for POST/PUT/PATCH/DELETE.

## Product API

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/api/products` | Catalogue / management |
| GET | `/api/product/{id}` | Product detail |
| GET | `/api/product/{id}/image` | Backend image endpoint; product JSON image bytes are also handled directly |
| GET | `/api/products/search?keyword=...` | Search |
| POST | `/api/product` | Multipart create |
| PUT | `/api/product/{id}` | Multipart update |
| DELETE | `/api/product/{id}` | Delete |

Create/update multipart field names are exactly:
- `product`: JSON blob matching the `Product` entity
- `imageFile`: image file

## Product JSON fields

`id`, `name`, `description`, `brand`, `price`, `category`, `releaseDate`, `productAvailable`, `stockQuantity`, `imageName`, `imageType`, `imageData`.

The backend serializes `imageData` in product responses. The frontend uses `imageType + imageData` when available, which avoids unauthenticated `<img>` requests to the protected image endpoint.

## Important backend limitation

The supplied backend contains no order, checkout, payment, address, or cart persistence endpoints. Therefore the frontend provides a local browser cart, but does not fake a successful checkout/order. The checkout button explicitly tells the user that those backend endpoints are not present.
