# backend/server.py
from fastapi import FastAPI
from pydantic import BaseModel
import asyncio
from main import run_workflow, WorkflowInput  # import your workflow
from dotenv import load_dotenv
import os

# Load API key from .env
load_dotenv()
if "OPENAI_API_KEY" not in os.environ:
    raise RuntimeError("Missing OPENAI_API_KEY in environment!")

app = FastAPI(title="Agentic Reconciliation Backend")

class WorkflowRequest(BaseModel):
    input_as_text: str

@app.post("/api/run-workflow")
async def run_agent_workflow(request: WorkflowRequest):
    """Endpoint to run your workflow."""
    try:
        result = await run_workflow(WorkflowInput(input_as_text=request.input_as_text))
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
