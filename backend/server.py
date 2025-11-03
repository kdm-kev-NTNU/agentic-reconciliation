import os
import asyncio
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form
from main import run_workflow, WorkflowInput

# Configure the logging system
logging.basicConfig(
    level=logging.INFO,  # Options: DEBUG, INFO, WARNING, ERROR, CRITICAL
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("backend.log"),  # saves logs to file
        logging.StreamHandler()              # also prints to terminal
    ]
)

logger = logging.getLogger(__name__)

load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

app = FastAPI(title="Agentic Reconciliation Backend")

# ✅ Allow your frontend origin
origins = [
    "http://localhost:5173",   # local dev frontend
    "https://your-frontend-domain.com"  # (optional) production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],   # allow POST, GET, etc.
    allow_headers=["*"],   # allow all headers
)


@app.post("/api/run-workflow")
async def run_agent_workflow(
    input_as_text: str = Form(...),
    nbim_file: UploadFile = File(None),
    custody_file: UploadFile = File(None)
):
    """Run workflow with optional CSV uploads appended as text."""
    logger.info("Workflow request received.")

    try:
        logger.info(f"User input: {input_as_text[:100]}...")  # log first 100 chars

        # Track uploaded files
        uploaded_files = []
        if nbim_file:
            uploaded_files.append(nbim_file.filename)
        if custody_file:
            uploaded_files.append(custody_file.filename)
        logger.info(f"Uploaded files: {', '.join(uploaded_files) or 'None'}")

        # Read the CSVs and turn them into text blocks
        extra_text = ""

        if nbim_file:
            nbim_bytes = await nbim_file.read()
            nbim_text = nbim_bytes.decode("utf-8", errors="ignore")
            extra_text += f"\n\n--- NBIM CSV START ---\n{nbim_text}\n--- NBIM CSV END ---\n"
            logger.debug(f"NBIM CSV size: {len(nbim_text)} characters")

        if custody_file:
            custody_bytes = await custody_file.read()
            custody_text = custody_bytes.decode("utf-8", errors="ignore")
            extra_text += f"\n\n--- CUSTODY CSV START ---\n{custody_text}\n--- CUSTODY CSV END ---\n"
            logger.debug(f"Custody CSV size: {len(custody_text)} characters")

        # Merge into one big prompt
        merged_prompt = f"{input_as_text.strip()}\n\n{extra_text}"
        logger.info(f"Final merged prompt length: {len(merged_prompt)} characters")

        # Call your workflow
        logger.info("Running agentic workflow...")
        workflow_input = WorkflowInput(input_as_text=merged_prompt)
        result = await run_workflow(workflow_input)
        logger.info("Workflow completed successfully.")

        return {
            "success": True,
            "uploaded_files": uploaded_files,
            "result": result
        }

    except Exception as e:
        logger.exception("Error while running workflow")
        return {"success": False, "error": str(e)}
