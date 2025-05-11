# STAGE 1: Builder - Installs dependencies
FROM python:3.12-slim-bookworm AS builder
WORKDIR /app

# Environment variables to make Python behave nicely in Docker
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install PyTorch and TorchVision CPU-ONLY first, very explicitly.
# Replace with the actual latest stable CPU versions for Python 3.12 from pytorch.org if different.
# The professional's example used hypothetical "April 2025" versions.
# For example, as of late 2023/early 2024, for Python 3.12, you might use:
# torch==2.2.2 torchvision==0.17.2
# ALWAYS VERIFY versions on https://pytorch.org/get-started/locally/ (select Linux, Pip, Python, CPU)
# The -f flag restricts pip to ONLY look for these specific torch/torchvision
# versions at the PyTorch CPU wheel index.
RUN pip install --upgrade --no-cache-dir \
    torch==2.2.2 \
    torchvision==0.17.2 \
    # Add 'torchaudio==<version>' here ONLY if you added 'torchaudio' to requirements.txt AND actually use it.
    -f https://download.pytorch.org/whl/cpu/torch_stable.html

# Now copy requirements.txt and install the rest of the dependencies.
# PyTorch and TorchVision will be skipped by pip here if already installed to the specified versions
# by the command above.
COPY requirements.txt .
RUN pip install --upgrade --no-cache-dir -r requirements.txt

# STAGE 2: Final - Copies only necessary artifacts from builder stage
FROM python:3.12-slim-bookworm
WORKDIR /app

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy installed packages from the builder stage's virtual environment
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
# Copy executables (like gunicorn) installed by pip from the builder stage
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy your application code
# This should come AFTER installing dependencies to optimize Docker layer caching
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "-w", "2", "app:app"]