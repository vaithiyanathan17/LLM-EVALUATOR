# Use Node.js for building React
FROM node:18 as builder

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all frontend files into the container
COPY . .

# Build the React app
RUN npm run build

# Use nginx to serve React
FROM nginx:alpine

# Copy built files to nginx server directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for frontend
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
