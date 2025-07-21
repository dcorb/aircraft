# Qoco Frontend

**Requires Node.js v20 or higher**

React + TypeScript frontend for Qoco project.

## Development

```sh
npm install
npm run dev
```

## Docker

### Build the Docker image

```sh
docker build -t qoco-frontend .
```

### Run the container

```sh
docker run -p 8080:80 qoco-frontend
```

- The frontend will be available at http://localhost:8080
