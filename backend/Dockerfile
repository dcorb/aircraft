# Use official Node.js image as the base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the data directory for seeding the SQLite database
COPY ./data ./data

# Build TypeScript
RUN npx tsc

# Expose backend port
EXPOSE 3001

# Start the backend server
CMD ["node", "dist/index.js"] 