## Agentic Reconciliation

> An intelligent, AI‑powered workflow that reconciles dividend data between NBIM internal bookings and global custodian records. Built as a lightweight full‑stack prototype for the NBIM case.

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688.svg)](https://fastapi.tiangolo.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3-brightgreen.svg)](https://vuejs.org/)

## Project Overview

This system transforms manual dividend reconciliation into an agent‑driven flow. It identifies breaks between NBIM and Custody datasets, triages them into auto vs. manual candidates, and produces a readable audit report.

- **Frontend**: Minimal Vue 3 interface for file upload, results visualization, and report rendering.
- **Backend**: FastAPI service exposing a single workflow endpoint.
- **Agents**: Well‑scoped prompts per stage (validation → detection → classification → correction → audit).

## Key Features

- **Agentic pipeline**: Validation, Break Detection, Classification, Correction, and Audit Reporting.
- **User‑gated automation**: Auto‑fix candidates surfaced with confidence and priority; manual review retained where needed.
- **Context carry‑over**: Stage outputs are persisted and reused to improve downstream steps.
- **Readable reporting**: Final compliance narrative is generated in Markdown and rendered in the UI.

## Risk Assessment

This section outlines the key technical and financial risks considered during the design of the Agentic Reconciliation System for NBIM. The goal is to balance innovation, data security, and operational efficiency while maintaining transparency and cost predictability.

### Technical Risks

#### 1. API Dependency & Data Privacy
Reliance on third-party APIs introduces risks around data exposure and control, especially given the sensitivity of financial records.

Mitigations:

- In-house model creation: Build or fine-tune proprietary LLMs internally to maintain full control of data processing.
- Enterprise agreements: Secure long-term, well-defined partnerships to ensure predictable costs, stable access, and compliance with privacy and residency regulations.

These strategies help guarantee data integrity, predictability, and compliance over time.

#### 2. Response Variability & Accuracy
LLMs can yield slightly different responses for identical inputs, which can impact consistency in reconciliation results.

Mitigations:

- Human-in-the-loop: Enable human review at key decision points to validate model outputs and correct misclassifications.
- Multi-agent system structure: Use several specialized agents instead of a single monolithic model to achieve clearer role delineations, more efficient prompt engineering, and better accuracy.

### Financial Risks

#### 1. Opportunity Cost
The main financial risk is the opportunity cost of not reaching the most efficient agent configuration—where suboptimal choices in model size or role granularity lead to higher latency and token costs, even when similar accuracy could be achieved with a leaner setup.

Mitigations:

- A/B testing: Continuously evaluate different architectures to identify the most efficient agent combinations.
- Architecture optimization: Avoid overly granular agent setups that increase latency and token costs without proportional accuracy gains.

The objective is to sustain high performance at minimal operational cost through data-driven experimentation.

## System Architecture

```mermaid
graph TD
  A[Upload NBIM & Custody CSVs] --> B[Backend /api/run-workflow]
  B --> C[Validation]
  C --> D[Break Detection]
  D --> E[Classification]
  E --> F[Correction]
  F --> G[Audit Report]
  G --> H[Frontend: Summary & Markdown Report]
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+

### Start the backend

Windows (from repo root):
```bat
cd backend
pip install -r requirements.txt
venv\Scripts\activate
cd ..
uvicorn backend.server:app --reload
```

macOS/Linux:
```bash
cd backend
pip install -r requirements.txt
source venv/bin/activate
uvicorn server:app --reload
```

### Start the frontend
```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

### Use the app
1. Upload NBIM and Custody CSV files and click “Identify Breaks”.
2. Review auto vs. manual candidates; run “Breaks Fixer” if available.
3. Generate and view the Markdown audit report.

## Architecture / Components

- **Frontend (Vue 3 + Vite)**: `AgentView.vue` (file upload + actions), `workflowService.ts` (calls), `MarkdownRenderer.vue` (report).
- **Backend (FastAPI)**: `/api/run-workflow` endpoint accepts form data (text, optional context, optional CSVs) and runs the agent workflow.
- **Agents**: Prompted stages mirrored in code and `prompt_docs/`.

## API Endpoint

- **POST** `/api/run-workflow`
  - Accepts: `input_as_text` (required), optional `context` (JSON), optional `nbim_file`, optional `custody_file`.
  - Returns: `{ success, uploaded_files, result }` with the latest stage output embedded.

## Folder Structure (high level)

```
agentic-reconciliation/
├─ backend/        # FastAPI app and workflow orchestration
├─ frontend/       # Vue 3 single‑page app
└─ prompt_docs/    # Agent prompt templates (see below)
```

## Prompt Design Philosophy

### Prompt Design Structure
- **Role Definition**: Defines the agent’s role and financial domain scope.
- **Task Clarity**: Lists the exact steps for this stage, in order.
- **Context Integration**: Describes how upstream state and inputs are consumed.
- **Output Schema**: Specifies a strict, machine‑readable structure.
- **Error Prevention**: Safety checks for consistency, deduplication, and critical flags.

## Prompt Documentation

All prompt templates are in `prompt_docs/` and correspond to the pipeline stages:

- `1_classifier_agent.md`: Routes requests into breaks identification, fixes, or report generation.
- `2_validation_agent.md`: Data Alignment & Semantic Validation across NBIM and Custody with mapping plan.
- `3_break_classifier_agent.md`: Break Detection producing a structured list of discrepancies per event.
- `4_classification_agent.md`: Break Classification & Human Review with prioritization and confidence.
- `5_correction_agent.md`: Correction & Audit Execution with safe auto‑corrections and manual recommendations.
- `6_auditing_agent.md`: Audit Trail & Report Generation that aggregates results into Markdown.

---

If a license or acknowledgements are added later, include them here.


