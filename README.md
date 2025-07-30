# Aircaft maintenance task visualization

This project contains a TypeScript/Express backend and a React/TypeScript frontend, fully containerized and ready for development or production.

<img width="2436" height="1200" alt="image" src="https://github.com/user-attachments/assets/8518bac9-bb47-4cd8-a3da-02a9c4d82823" />

---

## Quick Start (Recommended)

To run the project with **Docker Compose**, both frontend and backend together with proper networking and environment variables:

```sh
docker compose up --build
```

That's it, the app will be available at:

- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001

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
  backend/    # Node.js/Express/TypeScript API
  frontend/   # React/TypeScript app (Vite)
```

---

## Development Setup

### 1. Start the Backend

```sh
cd backend
npm install
npm run dev
# The backend runs on http://localhost:3001
```

### 2. Start the Frontend

```sh
cd frontend
npm install
# Copy .env.example to .env for local development
cp .env.example .env
npm run dev
# The frontend runs on http://localhost:5173 (default Vite port)
```

---

## Linting & Formatting

Both projects use ESLint (with Prettier integration):

- Lint: `npm run lint`
- Auto-fix: `npm run lint:fix`

VSCode is configured to auto-fix and format on save.

---

## Next steps:

- **No timezone management:** All dates/times are considered UTC. No conversion or timezone logic is applied.
- **No authentication, API rate limiting, etc.:** The API is open and unsecured for demo/development purposes only.
