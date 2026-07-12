# ArtsDiva — Deployment Guide (Azure backend + Vercel frontend)

## Why login was breaking on iPhone / Chrome Incognito

Auth originally used an `httpOnly` session cookie. Frontend
(`artsdiva.bharatbytetech.com`) and backend
(`artsdiva-be-....azurewebsites.net`) are on different domains, so the
browser treated the cookie as *third-party*:
- **iOS Safari** (and every browser on iOS — Chrome/Firefox there are all
  Safari/WebKit under the hood) blocks third-party cookies unconditionally,
  normal browsing and private mode alike.
- **Chrome Incognito** blocks third-party cookies by default too.

`SameSite=None; Secure` doesn't help — both strip the cookie regardless once
it's flagged third-party.

**Fix shipped:** auth no longer uses a cookie at all. Login returns the JWT
in the JSON response body; the frontend stores it in `localStorage` and
sends it back as `Authorization: Bearer <token>` on every request
(`artsdiva-frontend/utils/authToken.ts`, `artsdiva-frontend/api/http.ts`,
`artsdiva-backend/src/middleware/auth.middleware.ts`). Since this isn't a
cookie, none of the third-party-cookie / `SameSite` rules apply, on any
browser — this class of bug cannot recur. Backend CORS is fully open
(`origin: "*"`) since there's no credentialed-cookie request to restrict.

**Trade-off, so it's written down somewhere:** the token is in
`localStorage`, which is readable by any JS running on the page — a
successful XSS can steal it directly, unlike the old `httpOnly` cookie
which JS could never read even under XSS. This is a standard, widely-used
pattern; just keep it in mind if a dependency audit or CSP hardening pass
ever comes up — that's the mitigation for this trade-off, not another auth
rewrite.

---

## Backend (Azure App Service) environment variables

Set these under App Service → *Configuration* → *Application settings*.

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `mongodb+srv://...` | Existing Atlas connection string |
| `JWT_SECRET` | long random string | Never reuse the dev value |
| `JWT_EXPIRES_IN` | `7d` | How long a login stays valid before the token is rejected server-side |
| `PORT` | leave unset | Azure injects its own `PORT`; the app already reads `process.env.PORT` |
| `NODE_ENV` | `production` | Disables verbose Prisma logging |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection string | Server-side only, never sent to the frontend |
| `AZURE_STORAGE_CONTAINER_NAME` | `images` | Or your chosen container name |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | — | Only needed when running the seed script once |

No CORS or cookie-domain env vars are needed — CORS is open by design (see
above) and there's no cookie to scope.

After setting/changing any of these, restart the App Service.

### One-time deploy commands (App Service SSH/Kudu console, or CI)
```
pnpm install
pnpm prisma:generate
pnpm build
pnpm start
```

---

## Frontend (Vercel) environment variables

Set under Vercel → Project → *Settings* → *Environment Variables* (apply to
Production, and Preview too if previews should hit the same API).

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://artsdiva-be-g2ffg9agdcdcehfq.centralindia-01.azurewebsites.net` | **Baked in at build time** — changing it requires a redeploy, not just saving the var. A custom domain on the backend is optional now (nice for a cleaner URL, but no longer required for auth to work) |

Custom domain (`artsdiva.bharatbytetech.com`) stays configured as-is under
Vercel → *Domains*.

---

## Verifying the fix

- DevTools → Application → Local Storage on `artsdiva.bharatbytetech.com`
  after login: should show an `artsdiva_token` key with the JWT.
- DevTools → Network → any authenticated request (e.g. `/api/auth/me`):
  Request Headers should show `Authorization: Bearer <token>`.
- Test on: Chrome normal, Chrome Incognito, Safari normal, Safari Private,
  and an actual iPhone. All five should log in and stay logged in after a
  refresh.

---

## Optional: custom domain for the backend

Not required anymore (auth doesn't care what domain the API is on), but if
you want a cleaner URL than `*.azurewebsites.net`:
1. GoDaddy DNS → add `CNAME` record `api.artsdiva` →
   `artsdiva-be-g2ffg9agdcdcehfq.centralindia-01.azurewebsites.net`.
2. Azure Portal → App Service → *Custom domains* → *Add custom domain* →
   `api.artsdiva.bharatbytetech.com` → validate (Azure will show an extra
   TXT/CNAME verification record — add that in GoDaddy too).
3. *Add binding* → **App Service Managed Certificate (free)** → wait for it
   to issue and bind (this step can take anywhere from minutes to a few
   hours — Azure's cert-issuance queue, not something you can speed up).
4. Once bound, update `NEXT_PUBLIC_API_URL` in Vercel and redeploy.
