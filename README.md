# Qoco Monorepo

This project contains a TypeScript/Express backend and a React/TypeScript frontend, fully containerized and ready for development or production.

---

## Requirements

- **Node.js v20 or higher** (for local development)
- **npm**
- **Docker** (for containerized usage)

---

## Project Structure

```
qoco/
  backend/    # Node.js/Express/TypeScript API
  frontend/   # React/TypeScript app (Vite)
```

---

## Development Setup

### 1. Start the Backend

```sh
cd backend
npm install
npm run build
npm start
# The backend runs on http://localhost:3001
```

### 2. Start the Frontend (with API proxy)

```sh
cd frontend
npm install
npm run dev
# The frontend runs on http://localhost:5173 (default Vite port)
# API requests to /api/* are proxied to the backend
```

---

## Example: Backend-to-Frontend API

- The backend exposes a GET endpoint at `/api/message`.
- The frontend fetches and displays this message on load.

---

## Docker Usage

### Backend

```sh
cd backend
docker build -t qoco-backend .
docker run -p 3001:3001 qoco-backend
```

### Frontend

```sh
cd frontend
docker build -t qoco-frontend .
docker run -p 8080:80 qoco-frontend
```

---

## Linting & Formatting

Both projects use ESLint (with Prettier integration):

- Lint: `npm run lint`
- Auto-fix: `npm run lint:fix`

VSCode is configured to auto-fix and format on save.

---

## Notes

- Make sure the backend is running before starting the frontend for API requests to work.
- For production, serve the frontend from a static host and point it to the backend API.
