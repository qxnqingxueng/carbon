"""Creates the 'carbondesk' database (if missing) and all tables. Run once: python init_db.py"""
import os
import re
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/carbondesk")
m = re.match(r".*//([^:]+):([^@]*)@([^:/]+):(\d+)/(.+)", url)
if not m:
    raise SystemExit("Could not parse DATABASE_URL in your .env file. Check it matches the example.")
user, pw, host, port, dbname = m.groups()

# connect to the default 'postgres' database to create ours
conn = psycopg2.connect(dbname="postgres", user=user, password=pw, host=host, port=port)
conn.autocommit = True
cur = conn.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (dbname,))
if cur.fetchone():
    print(f"Database '{dbname}' already exists.")
else:
    cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(dbname)))
    print(f"Created database '{dbname}'.")
cur.close()
conn.close()

# create tables
from app.db import Base, engine
from app import models  # noqa: F401  (registers the models)
Base.metadata.create_all(bind=engine)
print("Tables created. Backend is ready — run: python -m uvicorn app.main:app --reload --port 8000")
