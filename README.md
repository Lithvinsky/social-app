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

## Troubleshooting

| Issue | Fix |
|--------|-----|
| `MONGO_URI is required` | Create `backend/.env` with `MONGO_URI=...` |
| `JWT_*_SECRET` errors | Set both secrets in `backend/.env` (long random strings) |
| API 401 after a while | Refresh cookie + `POST /auth/refresh` — use same origin (`/api` proxy) in dev |
| Stuck on “Loading…” | Clear site data / `localStorage` for the app origin |
| Image uploads fail | Set Cloudinary vars in `backend/.env` or post text-only |
