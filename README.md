# HVAC Backend

Backend API for the Seas Heating and AC website. Receives contact form
submissions and emails them to `info@seasheatingandac.com` via SendGrid.

## Setup

```bash
npm install
cp .env.example .env   # then paste your SendGrid API key into .env
```

## Run

```bash
npm start        # production
npm run dev      # development (auto-restarts on file changes)
```

The server listens on port 5000 by default (configurable via `PORT`).

## Endpoints

- `POST /api/contact` — body: `{ "name": "...", "title": "...", "description": "..." }`
- `GET /health` — health check

## Frontend integration

- **Local development:** the frontend (`HVAC-LandingPage`) proxies `/api` requests
  to `http://localhost:5000` automatically. Just run both projects.
- **Production:** deploy this project to any Node host (Render, Railway, a VPS, etc.),
  set `SENDGRID_API_KEY` in that host's environment variables, and set
  `REACT_APP_API_URL` to the deployed backend URL when building the frontend.
  Add the site's domain to `ALLOWED_ORIGINS` in `server.js` if it changes.
