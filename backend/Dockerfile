FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) for build
RUN npm ci

# Copy source code
COPY . .

# Create directories for uploads and documents
RUN mkdir -p uploads documents

# Build TypeScript code
RUN npm run build

# Remove dev dependencies for a smaller production image
RUN npm prune --production

# Start the application
CMD ["npm", "start"]