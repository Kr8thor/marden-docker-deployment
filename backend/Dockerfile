FROM node:18-alpine

WORKDIR /app

# Copy package.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the files
COPY . .

ENV NODE_ENV=production

# Expose the API port
EXPOSE 3000

# Start the application
ENTRYPOINT ["npm", "start"]
