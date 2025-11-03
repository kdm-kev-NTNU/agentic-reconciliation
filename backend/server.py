from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import asyncio
from main import run_workflow, WorkflowInput
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI(title="Agentic Reconciliation Backend")

@app.post("/api/run-workflow")
async def run_agent_workflow(
    input_as_text: str = Form(...),
    nbim_file: UploadFile = File(None),
    custody_file: UploadFile = File(None)
):
    """Run workflow with optional CSV uploads appended as text."""
    try:
        # Read the CSVs and turn them into text blocks
        extra_text = ""

        if nbim_file:
            nbim_bytes = await nbim_file.read()
            nbim_text = nbim_bytes.decode("utf-8", errors="ignore")
            extra_text += f"\n\n--- NBIM CSV START ---\n{nbim_text}\n--- NBIM CSV END ---\n"

        if custody_file:
            custody_bytes = await custody_file.read()
            custody_text = custody_bytes.decode("utf-8", errors="ignore")
            extra_text += f"\n\n--- CUSTODY CSV START ---\n{custody_text}\n--- CUSTODY CSV END ---\n"

        # Merge into one big prompt
        merged_prompt = f"{input_as_text.strip()}\n\n{extra_text}"

        # Call your existing workflow with that as plain text
        workflow_input = WorkflowInput(input_as_text=merged_prompt)
        result = await run_workflow(workflow_input)

        return {
            "success": True,
            "final_prompt": merged_prompt,
            "result": result
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
