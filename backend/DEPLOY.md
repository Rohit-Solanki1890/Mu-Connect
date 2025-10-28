Deployment notes — CORS and preview domains

This file explains recommended environment variables and values for Render (backend) and Vercel (frontend) to make CORS and Socket.io work correctly.

1) Vercel (frontend) — Environment variables

- VITE_API_URL
  - Value: https://mu-connect-backend.onrender.com
  - Note: Do NOT include a trailing slash or `/api`. The frontend code calls endpoints like `/api/auth/login`.

2) Render (backend) — Environment variables

- CLIENT_URLS (optional)
  - Comma-separated exact domains to allow. Example:
    https://muconnect-eight.vercel.app,https://muconnect-ra1ifuaoj-rohit-solankis-projects-15ec10e3.vercel.app,https://your-production-domain.vercel.app
  - Do NOT include trailing slashes.

- CLIENT_PATTERNS (optional)
  - Comma-separated regular expressions (JS regex strings) for matching preview domains.
  - Example to allow all Vercel previews for this project:
    ^https:\/\/muconnect-.*\.vercel\.app$
  - Combine with CLIENT_URLS if you need specific exact domains too.

3) Recommended setup

- For production: set `CLIENT_URLS` to your production domain (and any staging domain).
- For preview workflows: either add specific preview domains to `CLIENT_URLS` or use `CLIENT_PATTERNS` with a safe regex that matches only your project's preview subdomains.
- If both `CLIENT_URLS` and `CLIENT_PATTERNS` are empty, the server allows any origin (development convenience). Do NOT leave this in place for long in production.

4) Redeploy steps

- After updating Render env variables, redeploy or restart the backend service so new env values are picked up.
- After updating Vercel env (VITE_API_URL), redeploy the frontend and clear the build cache.

5) Quick smoke test (from your machine)

```powershell
curl -i -X OPTIONS "https://mu-connect-backend.onrender.com/api/auth/login" `
  -H "Origin: https://muconnect-ra1ifuaoj-rohit-solankis-projects-15ec10e3.vercel.app" `
  -H "Access-Control-Request-Method: POST"
```

Check the response headers; `Access-Control-Allow-Origin` should match the Origin you sent if allowed.
