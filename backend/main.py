from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import httpx

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
WORKFLOW_ID = os.getenv("WORKFLOW_ID")

if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY in .env file")
if not WORKFLOW_ID:
    raise RuntimeError("Missing WORKFLOW_ID in .env file")


app = FastAPI(title="Agentic Workflow Backend")


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Backend is running and healthy"}


async def run_workflow_direct(user_text: str):
    """
    Calls the OpenAI Workflows REST API endpoint directly,
    avoiding SDK limitations.
    """
    url = "https://api.openai.com/v1/workflows/runs"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "workflow_id": WORKFLOW_ID,
        "input": {"input_as_text": user_text},
    }

    print(f"Sending request to OpenAI workflow: {WORKFLOW_ID}")
    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(url, headers=headers, json=payload)

    if response.status_code >= 400:
        print("Error from OpenAI:", response.text)
        return {"error": f"OpenAI API error {response.status_code}", "details": response.text}

    data = response.json()
    print("Workflow executed successfully")
    return data
