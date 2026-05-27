import ollama
from prompts import build_prompt


def clean_sql(sql):

    sql = sql.replace("```sql", "")
    sql = sql.replace("```", "")
    sql = sql.replace(";", "")

    sql = sql.strip()

    return sql


def generate_sql(user_question):

    print("Building prompt...")

    prompt = build_prompt(user_question)

    print("Sending to Ollama...")

    response = ollama.chat(
        model='qwen2.5:7b',
        messages=[
            {
                'role': 'user',
                'content': prompt
            }
        ]
    )

    print("Received response")

    sql_query = response['message']['content']

    sql_query = clean_sql(sql_query)

    print("CLEANED SQL:")
    print(sql_query)

    return sql_query