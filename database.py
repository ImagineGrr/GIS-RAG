import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine(
    "postgresql://postgres:1234567890@localhost:5432/postgres"
)

def run_query(sql):

    with engine.connect() as connection:

        result = connection.execute(text(sql))

        rows = result.fetchall()

        columns = result.keys()

        df = pd.DataFrame(rows, columns=columns)

        return df