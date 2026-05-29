# GeoAI Assistant — Intelligent GIS Chatbot

GeoAI Assistant is a lightweight FastAPI application that lets users query a Postgres/PostGIS government GIS building dataset using natural language. The backend converts user questions to SQL (via an LLM), validates the SQL for safety, executes it against a PostGIS-enabled database, and returns results to a simple web frontend.

## Features
- Natural-language to SQL translation using an LLM (Ollama client integration).
- SQL safety validator to reject potentially unsafe statements.
- Executes read-only SELECT queries on a PostGIS-enabled PostgreSQL database.
- Simple web chat UI served with FastAPI templates + static assets.

## Repository layout

- `app.py` — FastAPI app and HTTP routes (web UI + `/ask` API).
- `ai.py` — Builds prompt and calls the Ollama model to generate SQL.
- `prompts.py` — Prompt template and schema metadata injection for the model.
- `schema_metadata.py` — Schema description used to inform the model about available tables/columns.
- `validator.py` — Basic SQL safety checks (ensures `SELECT` and blocks forbidden keywords).
- `database.py` — Runs SQL queries using SQLAlchemy and returns a pandas DataFrame.
- `templates/index.html` — Minimal chat frontend.
- `static/` — Frontend CSS and JS (`style.css`, `script.js`).

## Prerequisites
- Python 3.8+
- PostgreSQL with PostGIS extension and a dataset matching the `schema_metadata.py` schema.
- Ollama (local LLM runtime) with an accessible model (example in code: `qwen2.5:7b`).

Make sure Ollama is running and the model specified in `ai.py` is available, or update the model name.

## Configuration
- Database connection is in `database.py`:

	engine = create_engine("postgresql://postgres:3010@localhost:5432/postgres")

	Update this connection string to match your database credentials and host.

- The prompt and schema are controlled in `prompts.py` and `schema_metadata.py`. Edit the `SCHEMA_INFO` mapping to reflect your real table/column descriptions.

## Install (recommended)

Create a virtual environment and install required packages (example):

```bash
python -m venv .venv
source .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy pandas ollama psycopg2-binary jinja2
```

## Run

1. Ensure PostgreSQL/PostGIS is running and accessible.
2. Ensure Ollama is running with the desired model.
3. Start the FastAPI app:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

4. Open the web UI at: `http://localhost:8000`

## API

- GET `/ask?question=...` — Convert `question` to SQL, validate, execute, and return JSON.

Example response structure:

```json
{
	"question": "Show offices in Raipur",
	"answer": "Query executed successfully.",
	"generated_sql": "SELECT name_building, dist_name FROM gov_building WHERE dist_name ILIKE '%Raipur%' LIMIT 50",
	"results": [ { "name_building": "...", "dist_name": "Raipur" }, ... ]
}
```

## Security notes and recommendations
- `validator.py` currently blocks only `INSERT` and enforces that queries start with `SELECT`. Extend `FORBIDDEN_KEYWORDS` with other DDL/DML operations (e.g., `UPDATE`, `DELETE`, `DROP`, `;`, `pg_catalog`, `information_schema`) for stronger safety.
- Database credentials are currently in plaintext in `database.py`. Prefer environment variables or a config file for production.
- Limit LLM model access and carefully review generated SQL before running against sensitive datasets.

## Example questions to try
- "Show offices in Raipur"
- "Find coordinates of District Excise Office in Bijapur"
- "How many offices are there in each village?"
- "When was District Excise Office established?"

## Useful files

- `prompts.py` — customize instructions sent to the LLM.
- `schema_metadata.py` — keep this accurate to help the model generate correct SQL.
- `validator.py` — tighten filtering rules before production use.

## Next steps / improvements
- Add environment-based configuration for DB and Ollama model name.
- Harden SQL validation and add parameterized query execution.
- Add authentication for the API and rate-limiting.
- Add a `requirements.txt` or `pyproject.toml` for reproducible installs.

---

If you want, I can:

- generate a `requirements.txt` and a `.env`-backed config loader, or
- harden `validator.py` with an expanded deny list and unit tests.

