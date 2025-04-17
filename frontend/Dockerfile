FROM nginx:alpine

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a simple HTML file for testing
RUN mkdir -p /usr/share/nginx/html
COPY ./test-frontend.html /usr/share/nginx/html/index.html

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]