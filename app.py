from fastapi import FastAPI
from ai import generate_sql
from validator import validate_sql
from database import run_query

app = FastAPI()

@app.get("/ask")

def ask(question: str):

    sql_query = generate_sql(question)

    if not validate_sql(sql_query):
        return {
            "error": "Unsafe SQL generated",
            "generated_sql": sql_query
        }

    try:

        result = run_query(sql_query)

        return {
            "question": question,
            "generated_sql": sql_query,
            "results": result.to_dict(orient="records")
        }

    except Exception as e:

        return {
            "error": str(e),
            "generated_sql": sql_query
        }