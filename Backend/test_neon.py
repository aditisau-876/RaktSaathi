
from sqlalchemy import text
from app.database import engine

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("Neon connection successful!")
        print("Database test result:", result.scalar())

        details = connection.execute(
            text("""
                SELECT
                    current_database(),
                    current_schema(),
                    current_user
            """)
        ).fetchone()

        print("Database:", details[0])
        print("Schema:", details[1])
        print("User:", details[2])

except Exception as error:
    print("Neon connection failed.")
    print(type(error).__name__, str(error))
