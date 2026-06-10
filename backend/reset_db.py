"""Reset the database to a clean slate (deletes ALL accounts and data).
Run from the backend folder:  .\\venv\\Scripts\\python reset_db.py
"""
from app.db import Base, engine
from app import models  # noqa: F401  (registers tables)

print("WARNING: this deletes ALL companies, users, assessments, suppliers, facilities and settings.")
ans = input("Type 'yes' to wipe and recreate the tables: ")
if ans.strip().lower() == "yes":
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Done — database reset to a clean, empty slate.")
else:
    print("Cancelled. Nothing changed.")
