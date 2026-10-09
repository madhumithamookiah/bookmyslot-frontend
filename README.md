# BookMySlot Frontend

React + TypeScript + Vite frontend. API handlers, authentication verification, email delivery, and database access live in the separate `bookmyslot-backend` repository.

## Folder guide

- `src/assets/` — assets imported and bundled by Vite.
- `src/components/` — reusable UI and feature components.
- `src/pages/` — full-page screens, including admin and super-admin screens.
- `src/services/` — HTTP API client functions. These call the backend; they do not connect to PostgreSQL.
- `src/store/` — shared client-side state (authentication, bookings, admin state).
- `src/types/` — TypeScript representations of frontend/API data.
- `src/data/` — static frontend data and display helpers.
- `src/config/` — runtime/build configuration such as the API base URL.

## Local development

1. In `bookmyslot-backend`, run `npm install`, configure `.env` from `.env.example`, and start it with `npm run dev` (Vercel dev server on port 3000).
2. In this repository, run `npm install` and `npm run dev` (Vite on port 5173). The Vite development proxy forwards `/api/*` to `http://localhost:3000`.
3. To use another local backend port, set `VITE_API_PROXY_TARGET`. For production, deploy the backend first, copy its actual deployment origin, set `VITE_API_BASE_URL` in the frontend host's **Build Environment Variables**, and trigger a new frontend deployment. Example only: `https://your-backend-project.vercel.app` (replace it with the real URL). Production builds intentionally fail if this variable is missing.

Do not put database URLs, SMTP credentials, session secrets, or other secrets in this repository or any `VITE_*` variable. Vite variables are exposed to browser code.

## API agreement

See [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md). Keep the frontend API client and backend handlers aligned when changing request/response shapes.
