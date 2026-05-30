from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage
from prompts import build_prompt

llm = ChatOllama(
    model="qwen2.5:7b",
    temperature=0,
)


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

    response = llm.invoke([HumanMessage(content=prompt)])

    print("Received response")

    sql_query = response.content

    sql_query = clean_sql(sql_query)

    print("CLEANED SQL:")
    print(sql_query)

    return sql_query