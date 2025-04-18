FROM node:18-alpine as frontend-build

# Build frontend
WORKDIR /app/frontend
COPY frontend/package.json ./
COPY frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ENV NODE_ENV=production
ENV VITE_API_URL=/api
RUN npm run build

# Backend setup
FROM node:18-alpine
WORKDIR /app

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package.json ./
COPY backend/package-lock.json ./
RUN npm ci
COPY backend/ ./

# Setup combined server
WORKDIR /app
COPY package.json ./
RUN npm install express http-proxy-middleware
COPY server.js ./

# Expose port
EXPOSE 3000

# Start the combined server
CMD ["node", "server.js"]
