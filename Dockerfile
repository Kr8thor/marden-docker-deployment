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

# Return to app root
WORKDIR /app

# Setup server
COPY package.json ./
RUN npm install
COPY server.js ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the combined server
CMD ["node", "server.js"]
