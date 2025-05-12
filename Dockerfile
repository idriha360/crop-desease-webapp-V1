# STAGE 1: Builder - Installs dependencies
FROM python:3.12-slim-bookworm AS builder
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install PyTorch and TorchVision CPU-ONLY first, very explicitly.
# Verify these are the latest suitable CPU versions from pytorch.org for Python 3.12 (Linux, Pip, CPU)
RUN pip install --upgrade --no-cache-dir \
    torch==2.2.2 \
    torchvision==0.17.2 \
    -f https://download.pytorch.org/whl/cpu/torch_stable.html

COPY requirements.txt .
RUN pip install --upgrade --no-cache-dir -r requirements.txt

# STAGE 2: Final - Copies only necessary artifacts from builder stage
FROM python:3.12-slim-bookworm
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "-w", "2", "app:app"]