FROM nginx:alpine

# Copy static files to nginx
COPY . /usr/share/nginx/html/

# Create a custom nginx config that properly handles SPA routing
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
  location /api { \
    proxy_pass https://railway-backend-production.up.railway.app; \
    proxy_http_version 1.1; \
    proxy_set_header Upgrade $http_upgrade; \
    proxy_set_header Connection "upgrade"; \
    proxy_set_header Host $host; \
    proxy_cache_bypass $http_upgrade; \
  } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
