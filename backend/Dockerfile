FROM node:22.22-bookworm

WORKDIR /app

# Install ffmpeg
RUN apt-get update \
 && apt-get install -y ffmpeg \
 && rm -rf /var/lib/apt/lists/*

ENV FFMPEG_PATH=/usr/bin/ffmpeg

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p uploads documents
RUN npm run build

CMD ["npm", "start"]