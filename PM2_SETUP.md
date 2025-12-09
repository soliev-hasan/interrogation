# PM2 Setup Guide

This guide explains how to run the web frontend, Node.js backend, and Python backend using PM2.

## Prerequisites

1. **Install PM2 globally:**

   ```bash
   npm install -g pm2
   ```

2. **Setup Python virtual environment (Recommended for Ubuntu/Linux):**

   ```bash
   # Run the setup script (creates venv and installs dependencies)
   ./scripts/setup-python-venv.sh
   ```

   Or manually:

   ```bash
   cd backend-py
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   cd ..
   ```

   **Note:** The ecosystem config uses `./backend-py/venv/bin/python3` by default. If you're using a different Python setup (like pyenv on macOS), update the `script` path in `ecosystem.config.cjs`.

3. **Build the frontend:**

   ```bash
   npm install --legacy-peer-deps
   npm run build
   ```

   **Note:** If you get rollup errors on Ubuntu/Linux, run:
   ```bash
   ./scripts/fix-rollup-ubuntu.sh
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

- **Web Frontend**: http://localhost:4000 (Vite preview, configurable via PORT env)
- **Node Backend**: http://localhost:4001 (or PORT from .env)
- **Python Backend**: http://localhost:8000

## Troubleshooting

1. **If frontend doesn't work with `vite preview`:**

   - Make sure you've built the frontend: `npm run build`
   - Check if port 4000 (or configured PORT) is available
   - **If you get rollup errors on Ubuntu/Linux:**
     ```bash
     ./scripts/fix-rollup-ubuntu.sh
     ```
     This will reinstall dependencies with the correct platform-specific rollup binary

2. **If Node backend fails:**

   - Ensure MongoDB is running and accessible
   - Check `.env` file has correct database connection
   - Verify backend is built: `cd backend && npm run build`

3. **If Python backend fails:**

   - Ensure Python 3.8+ is installed: `python3 --version`
   - **On Ubuntu/Linux:** Make sure virtual environment is set up:
     ```bash
     ./scripts/setup-python-venv.sh
     ```
   - **If using system Python:** Install dependencies globally:
     ```bash
     pip3 install -r backend-py/requirements.txt
     ```
     Then update `ecosystem.config.cjs` to use `python3` instead of `./backend-py/venv/bin/python3`
   - **If using pyenv (macOS):** Use full path to pyenv Python in `ecosystem.config.cjs`:
     ```javascript
     script: "/Users/your-username/.pyenv/versions/3.13.0/bin/python3";
     ```
   - Verify uvicorn is installed in the Python you're using:

     ```bash
     # For venv
     ./backend-py/venv/bin/python3 -m pip list | grep uvicorn

     # For system Python
     python3 -m pip list | grep uvicorn
     ```

4. **Check logs:**
   ```bash
   pm2 logs --lines 100
   ```

## Alternative: Using Nginx for Frontend

If you prefer to use nginx for the frontend (like in Docker), you can modify the ecosystem.config.js to run nginx instead of vite preview. However, this requires nginx to be installed on your system.
