FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run expects the app to listen on $PORT (defaults to 8080)
ENV PORT=8080

CMD ["streamlit", "run", "pages/gait.py", "--server.port=8080", "--server.address=0.0.0.0"]
