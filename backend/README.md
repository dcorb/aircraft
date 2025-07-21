# Qoco Backend

**Requires Node.js v20 or higher**

TypeScript Node.js/Express backend for Qoco project.

## Development

```sh
npm install
npm run build
npm start
```

## Docker

### Build the Docker image

```sh
docker build -t qoco-backend .
```

### Run the container

```sh
docker run -p 3001:3001 qoco-backend
```

- The backend will be available at http://localhost:3001
