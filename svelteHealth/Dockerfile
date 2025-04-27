FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy both package.json and (if present) package-lock.json
COPY package*.json ./

# Install dependencies (will respect package-lock.json if it exists)
RUN npm install

# Copy the rest of your source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start in development mode on all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
