FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directories for uploads and documents
RUN mkdir -p uploads documents

# Build TypeScript code
RUN npm run build

# Start the application
CMD ["npm", "start"]