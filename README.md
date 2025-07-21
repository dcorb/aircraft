# Qoco Monorepo

This project contains a TypeScript/Express backend and a React/TypeScript frontend, fully containerized and ready for development or production.

---

## Quick Start (Recommended)

To run the project:

```sh
# Clone the repository
git clone <your-repo-url>
cd qoco

# Run everything with Docker Compose
docker compose up --build
```

That's it, the app will be available at:

- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001

No additional setup, environment files, or configuration needed.

---

## Tech Stack

### Frontend

- **React 19.1.0** - UI framework
- **TypeScript 5.8.3** - Type safety
- **Vite 7.0.4** - Build tool and dev server
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **shadcn/ui** - Pre-built UI components
  - Radix UI primitives
  - Lucide React icons
  - Class Variance Authority for component variants
- **ESLint 9.30.1** - Code linting
- **Prettier** - Code formatting

### Backend

- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **TypeScript 5.8.3** - Type safety
- **Better SQLite3 12.2.0** - Database
- **ts-node 10.9.2** - TypeScript execution
- **ESLint 9.31.0** - Code linting
- **Prettier** - Code formatting

### Development Tools

- **Docker** - Containerization
- **npm** - Package management
- **Git** - Version control

---

## Requirements

- **Docker** (for containerized usage)
- **Node.js v20 or higher** (for local development)

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

## Docker Compose

To run both frontend and backend together with proper networking and environment variables:

```sh
docker compose up --build
```

- The frontend will be available at http://localhost:8080
- The backend will be available at http://localhost:3001

The frontend will use the correct API URL via the `VITE_API_URL` environment variable set in `docker-compose.yml`.


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

---

## Out of Scope

- **No timezone management:** All dates/times are considered UTC. No conversion or timezone logic is applied.
- **No authentication, API rate limiting, etc.:** The API is open and unsecured for demo/development purposes only.
