# GitHub Copilot Helper

This file describes how to call the assistant in this repo without having to explain the context again.

## Who I am
- Name: `GitHub Copilot`
- Model: `Raptor mini (Preview)`

## What I know in this repo
- The daily agent stores memos in Azure Blob Storage under container `papertrading`.
- The memo text is stored in `agent_log.parquet` in the `memo` column.
- The backend path for storage helpers is `backend/storage/blobs.py`.
- The agent runtime is in `backend/agent/loop.py` and the HTTP API is in `backend/function_app.py`.

## How to invoke me next time
Tell me something like:
- `Use GITHUB_COPILOT.md` or `Follow the instructions in GITHUB_COPILOT.md`
- `Access the memo storage using the repo helper`
- `Read the latest agent memo from papertrading/agent_log.parquet`

## Notes
- I can access repo files and run workspace-safe commands if needed.
- If you want me to fetch memos, tell me to read `papertrading/agent_log.parquet` with the current Azure settings.
