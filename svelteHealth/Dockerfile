FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start in development mode, binding to all interfaces so Docker can route traffic
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]