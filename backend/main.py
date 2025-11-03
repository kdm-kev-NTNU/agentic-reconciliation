from fastapi import FastAPI

app = FastAPI(title="Agentic Workflow Backend")

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Backend is running and healthy"}
