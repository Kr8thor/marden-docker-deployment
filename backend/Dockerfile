FROM node:18-alpine

WORKDIR /app

# Create a simple file
RUN echo 'console.log("Server running on port 3000"); require("http").createServer((req, res) => { res.writeHead(200, {"Content-Type": "application/json"}); res.end(JSON.stringify({status: "ok", message: "Backend is running"})); }).listen(3000);' > index.js

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
