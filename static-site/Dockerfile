FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy static files
COPY . .

# Set environment variables
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
