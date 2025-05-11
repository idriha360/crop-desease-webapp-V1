# STAGE 1: Builder - Installs dependencies
FROM python:3.12-slim-bookworm AS builder
WORKDIR /app

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy only the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# --upgrade: ensures packages are at their latest compatible versions.
# --no-cache-dir: reduces image size.
# -f https://download.pytorch.org/whl/cpu/torch_stable.html:
#   Crucially, tells pip to ALSO look for packages (especially torch, torchvision)
#   at this PyTorch CPU-specific wheel index. This is our primary guard against CUDA versions.
RUN pip install --upgrade --no-cache-dir -r requirements.txt

# STAGE 2: Final - Copies only necessary artifacts from builder stage
FROM python:3.12-slim-bookworm
WORKDIR /app

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy installed packages from the builder stage
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
# Copy executables (like gunicorn) installed by pip from the builder stage
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy your application code
# This comes AFTER installing dependencies to optimize Docker layer caching
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "-w", "2", "app:app"]