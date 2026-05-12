# Orbit (Social app)

Full-stack social app branded **Orbit**: React + Vite frontend, Node/Express + MongoDB backend, Socket.IO. Market-style feed, posts, comments, DMs, and notifications. UI uses a **darker blue** theme (see `frontend/tailwind.config.js`).

## Tech stack

| Layer    | Stack |
|----------|--------|
| Frontend | React, Vite, Tailwind CSS, Redux |
| Backend  | Express, Mongoose, JWT + refresh cookies, Socket.IO |
| Data     | MongoDB (local, Atlas, or Docker Compose) |

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)

## Quick start

1. **Start MongoDB** (pick one):

   ```bash
   docker compose up -d
   ```

   Or use your own Atlas URI in `backend/.env` as `MONGO_URI`.

2. **Backend env**

   ```bash
   cd backend
   cp .env.example .env
   ```

   On Windows (PowerShell):

   ```powershell
   Copy-Item .env.example .env
   ```

   Edit `backend/.env`: set `MONGO_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` (each at least 32 random characters). Optionally set Cloudinary vars if you use profile avatar uploads.

3. **Install & run everything**

   From the `social-app` folder:

   ```bash
   npm install
   npm run install:all
   npm run dev
   ```

   - API: [http://localhost:5050](http://localhost:5050) (`GET /health`)
   - Web (Orbit): [http://localhost:5174](http://localhost:5174)

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

## Project layout

```text
social-app/
├── backend/          API + Socket.IO (PORT from .env, default 5050)
├── frontend/         Orbit UI (Vite dev server on 5174)
├── docker-compose.yml
├── render.yaml       Optional Render.com Blueprint (API + static site)
└── README.md
```

## Frontend environment variables

Copy `frontend/.env.example` to `frontend/.env` when you need overrides.

| Variable | When to set |
|----------|-------------|
| `VITE_API_URL` | Production / preview builds, or when the browser must call a **remote** API (full origin, **no** trailing slash). |
| `VITE_SOCKET_URL` | Usually the **same** origin as the API for Socket.IO (e.g. Render URL). |
| `VITE_PROXY_TARGET` | Local dev only: backend URL for the Vite proxy if not `http://127.0.0.1:5050`. |

- **Local dev (recommended):** Leave `VITE_API_URL` unset. The app uses same-origin `/api`; Vite proxies to `http://127.0.0.1:5050` (see `frontend/vite.config.js`), matching `backend/.env.example`.
- **Legacy alias:** `VITE_API_BASE` is still read if `VITE_API_URL` is empty.

## Deploying the frontend (Vercel)

Vercel serves only the **static** build. There is no Node API and no dev proxy, so you must set API URLs at **build** time.

1. **Vercel → Project → Settings → Environment Variables** (Production / Preview):
   - `VITE_API_URL` = public API origin, e.g. `https://your-api.onrender.com` (no trailing slash)
   - `VITE_SOCKET_URL` = same host as the API for Socket.IO
2. **Redeploy** after any change (Vite bakes these in at build).
3. On the **API**, set `CLIENT_ORIGIN` to your Vercel URL (e.g. `https://your-app.vercel.app`). If frontend and API are on different sites, set `REFRESH_COOKIE_SAMESITE=none` (HTTPS required).

`frontend/vercel.json` rewrites unknown paths to `/` so client routes (e.g. `/login`) work on refresh.

## Deploying with Render

Use `render.yaml` as a Blueprint, or create services manually:

- **Web service:** root `backend/`, `npm install`, `npm start`, health check `/health`
- **Static site:** root `frontend/`, build `npm install && npm run build`, publish `dist`, with `VITE_API_URL` (and usually `VITE_SOCKET_URL`) pointing at your deployed API

## Troubleshooting

| Issue | Fix |
|--------|-----|
| `MONGO_URI is required` | Add `MONGO_URI=...` to `backend/.env` |
| `JWT_*_SECRET` errors | Set both secrets in `backend/.env` (long random strings) |
| API 401 after a while | Refresh uses cookies + `POST /api/auth/refresh` — in dev, keep the `/api` proxy so origins match |
| Vercel: 404 on `/api/...` or wrong host | Set `VITE_API_URL` and `VITE_SOCKET_URL`, then rebuild |
| Vercel: CORS or refresh cookie fails | Set `CLIENT_ORIGIN` on the API; `REFRESH_COOKIE_SAMESITE=none` when API and app differ |
| Stuck on “Loading…” | Clear site data / `localStorage` for the app origin |
| Avatar upload ignored | Set `CLOUDINARY_*` in `backend/.env` and restart the API |
