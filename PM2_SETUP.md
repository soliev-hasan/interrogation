# PM2 Setup Guide

This guide explains how to run the web frontend, Node.js backend, and Python backend using PM2.

## Prerequisites

1. **Install PM2 globally:**

   ```bash
   npm install -g pm2
   ```

2. **Install Python dependencies:**

   ```bash
   cd backend-py
   pip install -r requirements.txt
   cd ..
   ```

3. **Build the frontend:**

   ```bash
   npm install
   npm run build
   ```

4. **Build the Node.js backend:**

   ```bash
   cd backend
   npm install
   npm run build
   cd ..
   ```

5. **Create logs directory:**
   ```bash
   mkdir -p logs backend/logs
   ```

## Environment Variables

Make sure you have a `.env` file in the root directory with all necessary environment variables:

- Database connection strings
- API keys
- Port numbers
- etc.

## Running with PM2

### Start all services:

```bash
pm2 start ecosystem.config.cjs
```

### Start individual services:

```bash
pm2 start ecosystem.config.cjs --only web-frontend
pm2 start ecosystem.config.cjs --only node-backend
pm2 start ecosystem.config.cjs --only python-backend
```

### Stop all services:

```bash
pm2 stop ecosystem.config.cjs
```

### Stop individual service:

```bash
pm2 stop web-frontend
pm2 stop node-backend
pm2 stop python-backend
```

### Restart all services:

```bash
pm2 restart ecosystem.config.cjs
```

### View status:

```bash
pm2 status
```

### View logs:

```bash
# All logs
pm2 logs

# Specific service logs
pm2 logs web-frontend
pm2 logs node-backend
pm2 logs python-backend
```

### Monitor resources:

```bash
pm2 monit
```

## PM2 Management Commands

### Save PM2 process list (for auto-start on reboot):

```bash
pm2 save
pm2 startup
```

### Delete all processes:

```bash
pm2 delete all
```

### Reload configuration:

```bash
pm2 reload ecosystem.config.cjs
```

## Service Ports

- **Web Frontend**: http://localhost:5173 (Vite preview)
- **Node Backend**: http://localhost:3000 (or PORT from .env)
- **Python Backend**: http://localhost:8000

## Troubleshooting

1. **If frontend doesn't work with `vite preview`:**

   - Make sure you've built the frontend: `npm run build`
   - Check if port 5173 is available

2. **If Node backend fails:**

   - Ensure MongoDB is running and accessible
   - Check `.env` file has correct database connection
   - Verify backend is built: `cd backend && npm run build`

3. **If Python backend fails:**

   - Ensure Python 3.8+ is installed
   - Check all dependencies are installed: `pip install -r backend-py/requirements.txt`
   - Verify uvicorn is installed: `pip install uvicorn[standard]`

4. **Check logs:**
   ```bash
   pm2 logs --lines 100
   ```

## Alternative: Using Nginx for Frontend

If you prefer to use nginx for the frontend (like in Docker), you can modify the ecosystem.config.js to run nginx instead of vite preview. However, this requires nginx to be installed on your system.
