FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (include dev deps for the TypeScript build)
RUN npm install -g pnpm
RUN pnpm install

# Install ffmpeg binary for audio processing
RUN apk add ffmpeg
# Make ffmpeg path explicit for app code
ENV FFMPEG_PATH=/usr/bin/ffmpeg

# Copy source code
COPY . .

# Create directories for uploads and documents
RUN mkdir -p uploads documents

# Build TypeScript code
RUN npm run build

# Start the application
CMD ["npm", "start"]