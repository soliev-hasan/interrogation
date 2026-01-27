FROM python:3.10-slim

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies (for soundfile/libsndfile and basic build tools)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libsndfile1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download model weights to bake into the image (avoids cold-start downloads)
RUN python - <<'PY'
from transformers import WhisperProcessor, WhisperForConditionalGeneration
MODEL_ID = "re-skill/whisper-large-v3-turbo-tj"
print(f"Downloading {MODEL_ID} ...")
WhisperProcessor.from_pretrained(MODEL_ID)
WhisperForConditionalGeneration.from_pretrained(MODEL_ID)
print("Download complete.")
PY

# Copy application code
COPY . .

# Default command (can be overridden by docker-compose)
CMD ["python", "app.py"]


