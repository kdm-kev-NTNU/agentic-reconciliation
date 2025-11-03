import os
import asyncio
import logging
import json
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


def _format_context_block(context_str: str) -> str:
    """Format context JSON string into delimited blocks appended to the prompt.

    Only includes known keys if present: validation_results, breaks_found_global,
    classified_breaks, corrections_list.
    """
    if not context_str:
        return ""
    try:
        data = json.loads(context_str)
        if not isinstance(data, dict):
            return ""
    except Exception:
        logger.warning("Malformed context JSON received; ignoring.")
        return ""

    known_keys = [
        "validation_results",
        "breaks_found_global",
        "classified_breaks",
        "corrections_list",
    ]

    parts: list[str] = []
    included: list[str] = []
    for key in known_keys:
        if key in data and isinstance(data[key], (dict, list)):
            try:
                pretty = json.dumps(data[key], indent=2)
            except Exception:
                pretty = str(data[key])
            parts.append(f"\n\n--- CONTEXT {key} START ---\n{pretty}\n--- CONTEXT {key} END ---\n")
            included.append(key)

    if included:
        logger.info(f"Context keys included: {', '.join(included)}")
    return "".join(parts)


@app.post("/api/run-workflow")
async def run_agent_workflow(
    input_as_text: str = Form(...),
    context: str = Form(None),
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
        context_block = _format_context_block(context) if context else ""
        merged_prompt = f"{input_as_text.strip()}\n\n{extra_text}{context_block}"
        if context_block:
            logger.info(f"Context block length added: {len(context_block)} characters")
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
