# Sambhav Store — React Frontend

Frontend matched to the supplied Spring Boot backend.

## Backend contract
- API: `http://localhost:8089/api`
- Frontend origin: `http://localhost:5173`
- Access JWT: browser memory only
- Refresh token: HttpOnly `refreshToken` cookie
- CSRF: frontend reads `XSRF-TOKEN` cookie and sends `X-XSRF-TOKEN` for protected state-changing requests
- Product create/update: multipart parts `product` and `imageFile`

## Run

```bash
npm install
npm run dev
```

The backend must be running on port `8089` and configured with its PostgreSQL/JWT environment variables.

For another API URL, create `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8089/api
```

## Notes

The backend currently permits CORS from `http://localhost:5173`, so use that Vite port for local development.


## Product management fix

This frontend is paired with the patched backend ZIP `ecom-app-backend-fixed-v2.zip`. Product create/update/delete APIs authenticate with the Bearer access JWT. The backend therefore does not require a CSRF header for product endpoints. Update requests may omit `imageFile`; the existing image is preserved.
