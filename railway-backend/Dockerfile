FROM node:18-alpine

WORKDIR /app

# First, copy only package files to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Then copy the rest of the application
COPY . .

# Expose the port
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
