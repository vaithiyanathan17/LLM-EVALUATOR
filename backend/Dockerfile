# Use Node.js as base image
FROM node:18

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy the rest of the application files
COPY . .

# Expose application port
EXPOSE 3000

# ✅ Run database migrations before starting the server
CMD ["node", "src/server.js"]
