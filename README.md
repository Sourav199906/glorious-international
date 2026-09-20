# Glorious International — MERN + AI Travel Platform

## Fixes applied in this pass

- **Google Sign-In was completely non-functional.** `server/src/config/env.js` never read `GOOGLE_CLIENT_ID` into the exported `env` object, so `authController.js`'s `env.googleClientId` check always failed and the endpoint returned "Google Sign-In is not configured" regardless of your `.env`. Added the missing field.
- **`GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` were missing from both deployment paths.** Added them to `render.yaml` (both services) and to `docker-compose.yml` / `client/Dockerfile` as a build arg, so Google login works after a real deploy, not just when running `npm run dev` with a hand-edited `.env`.
- **Client failed to install.** `@vitejs/plugin-react: "latest"` resolved to v6, which requires Vite 8, conflicting with the pinned `vite: ^6.0.7`. Pinned to `^4.7.0`.
- **Client failed to install (2).** `react-helmet-async@^2.0.5` doesn't declare React 19 support, which this project uses. Bumped to `^3.0.0` (drop-in compatible API).
- **Client failed to build.** `Home.jsx` imported a `Kaaba` icon from `lucide-react` that doesn't exist in the package, crashing the Vite production build. Swapped for `Landmark`.
- Removed a duplicate Mongo index warning on `PassportDocument.expiresAt` (was declared both via `index: true` and `schema.index(...)`).

Verified after fixes: `npm test` (server, 5/5 passing), `npm run build` (client, clean production build).



travel platform for Flights, Hajj and Tour Packages, with Reviews and an admin CMS.

## Included

- React + Vite + Tailwind + Framer Motion
- Express + MongoDB/Mongoose
- JWT access tokens + rotating HTTP-only refresh sessions
- Refresh-token reuse detection and session-family revocation
- Role-based ADMIN/STAFF/USER access
- Tour, Hajj and Flight management
- Rich admin CRUD forms
- Cloudinary image upload/storage adapter
- Verified customer Reviews + admin moderation
- Booking workflow with server-side amount validation
- Traveler passport-number encryption at rest
- SSLCOMMERZ hosted payment integration + IPN validation
- PDF booking confirmation + SMTP email attachment
- AI travel assistant using backend-only API credentials
- Analytics dashboard
- Security middleware, rate limiting, validation, audit logs
- SEO metadata, robots.txt and sitemap
- Automated API smoke/security tests with Node test runner + Supertest
- Dockerfiles + docker-compose + Render deployment blueprint

## Local setup

### Backend

```bash
cd server
cp .env.example .env
npm install
npm run seed:admin
npm test
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```



Set these in the server environment:

- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `TRAVELER_ENCRYPTION_KEY` — exactly 32 bytes/chars after your secret-management process
- `CLIENT_URL`
- `PUBLIC_API_URL`
- Cloudinary credentials
- SSLCOMMERZ store credentials
- SMTP credentials
- OpenAI API key

Do not commit `.env` files.

## Payment flow

1. User creates a pending booking.
2. Server calculates the authoritative amount from the selected product.
3. Server creates an SSLCOMMERZ hosted-payment session.
4. User completes payment on the gateway.
5. SSLCOMMERZ sends an IPN to `/api/payments/ipn`.
6. Server calls the SSLCOMMERZ validation API and checks transaction ID, amount and currency.
7. Booking becomes `PAID` and can be confirmed by an authorized staff/admin.
8. Confirmation generates the PDF and sends it by email when SMTP is configured.

SSLCOMMERZ requires server-side session initiation and transaction validation; keep the gateway credentials on the server only.

## Traveler data

Passport numbers are encrypted before MongoDB persistence. They are not returned by normal customer/admin booking APIs. If staff need a controlled document-review feature later, build a separate audited decryption endpoint with least-privilege authorization.

## Image storage

Images are uploaded from the admin dashboard to Cloudinary. MongoDB stores the resulting URL rather than image bytes.

## Production checklist

- Use HTTPS everywhere.
- Use strong random secrets from a secrets manager.
- Set `SSLCOMMERZ_SANDBOX=false` only after sandbox testing and merchant approval.
- Configure the SSLCOMMERZ IPN URL to the public `/api/payments/ipn` endpoint.
- Configure SMTP and verify SPF/DKIM/DMARC for the sending domain.
- Configure Cloudinary private/access policies appropriate for business assets.
- Put MongoDB behind network/IP controls and backups.
- Add centralized logs/monitoring and alerts.
- Run dependency scanning and regular updates.
- Add end-to-end browser tests before launch.
- Add a proper privacy policy and data-retention/deletion workflow.

## Passport-copy upload (required)

Every traveler must provide a **PDF passport copy** during checkout. The browser first uploads the PDF to `POST /api/passports/upload`, then the booking request includes the returned `fileId` for that traveler.

Security controls:
- PDF-only validation, 10 MB maximum per passport copy.
- Files are encrypted with AES-256-GCM before storage.
- Passport files are never exposed as public URLs and passport numbers remain encrypted in MongoDB.
- In production, configure a private S3-compatible bucket (`S3_*` variables); local disk is used only for development.
- Only ADMIN/STAFF can retrieve a claimed passport copy, and each access is written to the audit log.
- Temporary uploads expire automatically after 24 hours.

### Tour checkout flow

`Tour Details → Traveler count → Traveler 1..N information → Upload passport PDF for each traveler → Create booking → Payment → Admin confirmation → PDF + email`

The passport upload is deliberately a separate authenticated endpoint so the booking API never accepts raw file bytes or public passport URLs.


## Google Sign-In
The login page uses Google Identity Services. Set `VITE_GOOGLE_CLIENT_ID` in the client environment and `GOOGLE_CLIENT_ID` in the server environment to the same Web OAuth 2.0 client ID. The browser sends Google's ID token to `/api/auth/google`; the backend verifies the token against the configured client ID before creating or signing into the local MongoDB user and issuing the project's normal JWT/HTTP-only refresh session.

In Google Cloud Console, create a Web application OAuth client and add the exact deployed frontend origin to Authorized JavaScript origins (for example `https://your-domain.com`) and your local origin `http://localhost:5173` for development. Google requires a client ID for Sign In With Google and backend ID-token verification.
