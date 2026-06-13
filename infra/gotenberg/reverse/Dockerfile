FROM python:3.12-slim

WORKDIR /app

# Build deps for pdfplumber / cryptography wheels
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      gcc \
      libpoppler-cpp-dev \
      pkg-config \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 4000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "4000"]
