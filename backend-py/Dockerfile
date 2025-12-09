FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# - Cache pip downloads between builds
# - Prefer binary wheels
# - Use the CPU wheel index for PyTorch to avoid heavy source builds
ENV PIP_PREFER_BINARY=1
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install "numpy<2.0.0" && \
    pip install --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]