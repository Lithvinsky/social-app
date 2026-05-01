# Social app

Full-stack social app (React + Vite frontend, Node/Express + MongoDB backend, Socket.IO). Market-style feed, posts, comments, DMs, notifications.

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)

## Quick start

1. **Start MongoDB** (pick one):

   ```bash
   docker compose up -d
   ```

   Or use your own `MONGODB_URI`.

2. **Backend env**

   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `.env`: set `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (each at least 32 random characters), and optional `FINNHUB_*` / Cloudinary keys.

3. **Install & run everything**

   From the `social-app` folder:

   ```bash
   npm install
   npm run install:all
   npm run dev
   ```

   - API: [http://localhost:5050](http://localhost:5050) (`GET /health`)
   - Web: [http://localhost:5174](http://localhost:5174)

4. **Optional demo data**

   ```bash
   cd backend && npm run seed
   ```

   Demo logins (password `password123`): `alice@example.com`, `bob@example.com`, `carol@example.com`.

## Run apps separately

```bash
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev
```

## Frontend env

Copy `frontend/.env.example` to `frontend/.env` if needed. For local dev, the Vite proxy sends `/api` to the backend; keep `VITE_API_BASE` unset unless you call the API on another host.

## Deploying the frontend to Vercel

Vercel only serves the **static** Vite build. It does **not** run the Node API and has **no** dev-server proxy, so the default `baseURL` of `/api` will call your Vercel domain and return **404** unless you point the app at a real API.

1. In Vercel: **Project → Settings → Environment Variables** (for **Production** and **Preview** as needed), set:
   - `VITE_API_BASE` = your public API origin, e.g. `https://your-service.onrender.com` (no trailing slash)
   - `VITE_SOCKET_URL` = same origin as the API (Socket.io)
2. **Redeploy** after changing these (Vite reads them at build time).
3. On the **API** server, set `CLIENT_ORIGIN` to your Vercel URL (e.g. `https://your-app.vercel.app`) and `REFRESH_COOKIE_SAMESITE=none` if the API and app are on different sites (HTTPS required for `none`).

`frontend/vercel.json` adds a SPA rewrite so direct visits to client routes (e.g. `/login`) do not 404.

## Troubleshooting

| Issue | Fix |
|--------|-----|
| `MONGO_URI is required` | Create `backend/.env` with `MONGO_URI=...` |
| `JWT_*_SECRET` errors | Set both secrets in `backend/.env` (long random strings) |
| API 401 after a while | Refresh cookie + `POST /auth/refresh` — use same origin (`/api` proxy) in dev |
| Vercel: network errors, 404 on `/api/...` | Set `VITE_API_BASE` and `VITE_SOCKET_URL` in Vercel to your real API URL, then **rebuild**; see *Deploying the frontend to Vercel* |
| Vercel: CORS or login refresh fails | On the API, set `CLIENT_ORIGIN` to your Vercel URL; `REFRESH_COOKIE_SAMESITE=none` when API and app are on different hosts |
| Stuck on “Loading…” | Clear site data / `localStorage` for the app origin |
| Image uploads fail | Set Cloudinary vars in `backend/.env` or post text-only |
