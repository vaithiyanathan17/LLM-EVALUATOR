# Use Node.js as base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all backend files into the container
COPY . .

RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Expose port 3000 for backend API
EXPOSE 3000

# Start the backend server
CMD ["node", "src/server.js"]
