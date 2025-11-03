# ---- Python base image ----
    FROM python:3.11-slim

    # Create app directory
    WORKDIR /app
    
    # Copy dependency list and install
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    
    # Copy rest of the backend code
    COPY . .
    
    # Expose port (Railway assigns PORT automatically)
    ENV PORT=3001
    EXPOSE 3001
    
    # Command to run FastAPI via uvicorn
    CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3001"]
    