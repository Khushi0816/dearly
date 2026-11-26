from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


OWNED_TABLES = [
    "letters",
    "diary_entries",
    "future_letters",
    "memory_photos",
    "about_me",
    "user_settings",
]


def migrate_user_ownership(engine: Engine):
    """
    Add ownership columns and assign legacy records
    to the first existing account.
    """
    with engine.begin() as connection:
        for table in OWNED_TABLES:
            if not inspect(connection).has_table(table):
                continue

            columns = {
                column["name"]
                for column in inspect(connection).get_columns(table)
            }

            if "user_id" not in columns:
                connection.execute(text(
                    f"ALTER TABLE {table} "
                    "ADD COLUMN user_id INTEGER REFERENCES users(id)"
                ))

        # Add the letter status column to existing databases.
        if inspect(connection).has_table("letters"):
            letter_columns = {
                column["name"]
                for column in inspect(connection).get_columns("letters")
            }

            if "status" not in letter_columns:
                connection.execute(text(
                    "ALTER TABLE letters "
                    "ADD COLUMN status VARCHAR(20) "
                    "NOT NULL DEFAULT 'completed'"
                ))

        # One profile and settings row per user.
        if inspect(connection).has_table("about_me"):
            connection.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS "
                "ix_about_me_user_id ON about_me(user_id)"
            ))

        if inspect(connection).has_table("user_settings"):
            connection.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS "
                "ix_user_settings_user_id ON user_settings(user_id)"
            ))

        # Assign legacy records to the first existing account.
        if inspect(connection).has_table("users"):
            first_user_id = connection.execute(
                text("SELECT id FROM users ORDER BY id LIMIT 1")
            ).scalar()

            if first_user_id is not None:
                for table in OWNED_TABLES:
                    if inspect(connection).has_table(table):
                        connection.execute(
                            text(
                                f"UPDATE {table} "
                                "SET user_id = :user_id "
                                "WHERE user_id IS NULL"
                            ),
                            {"user_id": first_user_id},
                        )
