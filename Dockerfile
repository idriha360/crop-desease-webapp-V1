FROM python:3.12-slim-buster
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000 # Gunicorn will run on this port inside the container
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "-w", "2", "app:app"]