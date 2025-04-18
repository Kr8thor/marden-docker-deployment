# Builder stage
FROM node:18-alpine as builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built frontend from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates (Optional)
RUN mkdir -p /etc/nginx/ssl
#COPY ./ssl/cert.pem /etc/nginx/ssl/cert.pem
#COPY ./ssl/key.pem /etc/nginx/ssl/key.pem


# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]