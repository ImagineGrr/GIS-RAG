import re


FORBIDDEN_KEYWORDS = [
     "INSERT"
#     "UPDATE",
#     "DELETE",
#     "DROP",
#     "ALTER",
#     "CREATE",
#     "TRUNCATE",
#     "GRANT",
#     "REVOKE",
#     "EXECUTE",
#     "COPY",
#     "CALL",
#     "DO",
#     "pg_catalog",
#     "information_schema",
#     "pg_database",
#     ";",
#     "--",
#     "/*",
#     "*/",
#     "<",
#     ">"
 ]


def validate_sql(sql: str) -> bool:

    sql_upper = sql.upper()

    for keyword in FORBIDDEN_KEYWORDS:

        if keyword.upper() in sql_upper:
            return False

    if not sql.strip().startswith("SELECT"):
        return False

    return True