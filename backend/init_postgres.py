#!/usr/bin/env python3
"""
TIEI TPS Application - PostgreSQL Database Initialization & Migration Tool
Creates a new database on PostgreSQL server (10.82.126.44:5432),
creates all relational tables, and migrates existing SQLite records.

Usage:
    python backend/init_postgres.py --dbname tps_tiei_db --user postgres --password secret
    or simply set credentials in backend/.env and run:
    python backend/init_postgres.py
"""

import os
import sys
import argparse
import sqlite3
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))
import config

try:
    import psycopg2
    from psycopg2 import sql
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
except ImportError:
    print("[ERROR] psycopg2 is not installed. Please run: pip install psycopg2-binary")
    sys.exit(1)

BASE_DIR = Path(__file__).resolve().parent
SQLITE_DB_PATH = BASE_DIR / 'tps_database.db'
ENV_FILE = BASE_DIR / '.env'

def create_postgres_database(host, port, user, password, dbname, admin_db="postgres"):
    """Connects to the PostgreSQL admin database and creates the target database if missing."""
    print(f"\n[1/4] Connecting to PostgreSQL server ({host}:{port}) to verify database '{dbname}'...")
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            dbname=admin_db,
            connect_timeout=10
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Check if database already exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (dbname,))
        exists = cursor.fetchone()

        if not exists:
            print(f"[INFO] Database '{dbname}' does not exist yet. Creating database...")
            # Use sql.Identifier to safely quote the database name
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(dbname)))
            print(f"[SUCCESS] Database '{dbname}' successfully created on {host}:{port}!")
        else:
            print(f"[INFO] Database '{dbname}' already exists on {host}:{port}. Ready for schema verification.")

        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"[ERROR] Could not connect to PostgreSQL server at {host}:{port}: {e}")
        print("\nNote: If you are working outside the plant network, ensure you are connected to the corporate VPN or TIEI network.")
        return False

def create_tables(conn):
    """Creates the full TPS relational schema in PostgreSQL."""
    print("\n[2/4] Creating relational tables in PostgreSQL...")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        emp_no VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        division VARCHAR(100),
        working_area VARCHAR(150),
        designation VARCHAR(150),
        boss_name VARCHAR(150),
        current_level INTEGER DEFAULT 1,
        target_level INTEGER DEFAULT 2,
        training_status INTEGER DEFAULT 0,
        pre_test_score NUMERIC DEFAULT 0,
        post_test_score NUMERIC DEFAULT 0,
        assignment_status INTEGER DEFAULT 0,
        presentation_mgr INTEGER DEFAULT 0,
        presentation_vp INTEGER DEFAULT 0,
        presentation_dmd INTEGER DEFAULT 0,
        practitioner_certified INTEGER DEFAULT 0,
        jishuken_1 INTEGER DEFAULT 0,
        jishuken_2 INTEGER DEFAULT 0,
        champion_eval NUMERIC DEFAULT 0,
        champion_certified INTEGER DEFAULT 0,
        kaizens_submitted INTEGER DEFAULT 0,
        kaizens_approved INTEGER DEFAULT 0,
        cost_savings_inr NUMERIC DEFAULT 0,
        kpi_score NUMERIC DEFAULT 70.0,
        hierarchy_role VARCHAR(50) DEFAULT 'TL',
        hierarchy_rank INTEGER DEFAULT 4,
        reports_to_emp_no VARCHAR(50),
        gender VARCHAR(20) DEFAULT 'Male',
        avatar TEXT,
        password VARCHAR(100) DEFAULT 'tiei123',
        email VARCHAR(255),
        dept_code VARCHAR(50),
        last_synced_at VARCHAR(50)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS step_evidence (
        id SERIAL PRIMARY KEY,
        emp_id INTEGER REFERENCES employees (id) ON DELETE CASCADE,
        step_num INTEGER,
        step_title VARCHAR(255),
        filename VARCHAR(255),
        file_url TEXT,
        file_size VARCHAR(50),
        uploaded_at VARCHAR(50),
        remarks TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS training_attendance (
        id SERIAL PRIMARY KEY,
        emp_id INTEGER REFERENCES employees (id) ON DELETE CASCADE,
        emp_no VARCHAR(50),
        emp_name VARCHAR(255),
        batch_code VARCHAR(100),
        attendance_date VARCHAR(50),
        session_name VARCHAR(255),
        status VARCHAR(50),
        marked_by VARCHAR(100),
        marked_at VARCHAR(50),
        remarks TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS department_nominations (
        id SERIAL PRIMARY KEY,
        emp_id INTEGER REFERENCES employees (id) ON DELETE SET NULL,
        emp_no VARCHAR(50),
        emp_name VARCHAR(255),
        department VARCHAR(150),
        designation VARCHAR(150),
        proposed_level VARCHAR(100),
        nominated_by VARCHAR(150),
        nomination_date VARCHAR(50),
        justification TEXT,
        status VARCHAR(50),
        batch_code VARCHAR(100)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS komarigoto (
        id SERIAL PRIMARY KEY,
        emp_id INTEGER REFERENCES employees (id) ON DELETE CASCADE,
        challenge TEXT,
        category VARCHAR(50),
        current_condition TEXT,
        target_condition TEXT,
        impact TEXT,
        priority INTEGER,
        viewpoints_21 TEXT,
        countermeasures TEXT,
        feasibility VARCHAR(50),
        unfeasible_reason TEXT,
        status VARCHAR(50)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS certifications (
        id SERIAL PRIMARY KEY,
        cert_no VARCHAR(100) UNIQUE,
        emp_id INTEGER REFERENCES employees (id) ON DELETE CASCADE,
        emp_name VARCHAR(255),
        level_name VARCHAR(100),
        issue_date VARCHAR(50),
        signatory VARCHAR(150),
        status VARCHAR(50)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS training_batches (
        id SERIAL PRIMARY KEY,
        batch_code VARCHAR(100) UNIQUE,
        batch_name VARCHAR(255),
        level_name VARCHAR(100),
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        trainer_name VARCHAR(150),
        venue VARCHAR(150),
        status VARCHAR(50),
        capacity INTEGER DEFAULT 20,
        enrolled_count INTEGER DEFAULT 0
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kaizen_requests (
        id SERIAL PRIMARY KEY,
        control_no VARCHAR(100) UNIQUE,
        emp_id INTEGER REFERENCES employees (id) ON DELETE SET NULL,
        emp_no VARCHAR(50),
        emp_name VARCHAR(255),
        work_name VARCHAR(255),
        category VARCHAR(100),
        line VARCHAR(100),
        machine VARCHAR(100),
        material_cost NUMERIC DEFAULT 0,
        man_hours_cost NUMERIC DEFAULT 0,
        machine_cost NUMERIC DEFAULT 0,
        total_cost NUMERIC DEFAULT 0,
        status VARCHAR(50),
        request_date VARCHAR(50)
    );
    """)

    conn.commit()
    print("[SUCCESS] All 8 PostgreSQL tables verified/created!")

def migrate_sqlite_data(sqlite_path, pg_conn):
    """Copies all records from local SQLite database into PostgreSQL."""
    print(f"\n[3/4] Migrating existing plant records from SQLite ({sqlite_path.name}) to PostgreSQL...")
    if not os.path.exists(sqlite_path):
        print(f"[NOTICE] No local SQLite file found at {sqlite_path}. Skipping data migration.")
        return

    s_conn = sqlite3.connect(sqlite_path)
    s_conn.row_factory = sqlite3.Row
    s_cursor = s_conn.cursor()
    pg_cursor = pg_conn.cursor()

    tables = [
        "employees",
        "step_evidence",
        "training_attendance",
        "department_nominations",
        "komarigoto",
        "certifications",
        "training_batches"
    ]

    for table in tables:
        try:
            s_cursor.execute(f"SELECT * FROM {table}")
            rows = s_cursor.fetchall()
            if not rows:
                continue

            cols = [desc[0] for desc in s_cursor.description]
            col_names = ", ".join(cols)
            placeholders = ", ".join(["%s"] * len(cols))

            # Upsert into PostgreSQL
            insert_sql = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
            
            records = [tuple(row) for row in rows]
            pg_cursor.executemany(insert_sql, records)
            pg_conn.commit()

            # Reset serial sequence so new inserts get correct auto-increment IDs
            pg_cursor.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE(max(id), 1)) FROM {table};")
            pg_conn.commit()

            print(f"  -> Migrated {len(rows)} records into table '{table}'")
        except Exception as e:
            print(f"  -> [WARNING] Table '{table}' migration note: {e}")
            pg_conn.rollback()

    s_conn.close()
    print("[SUCCESS] Data migration completed successfully!")

def save_env_config(host, port, dbname, user, password):
    """Saves or updates PostgreSQL connection details in backend/.env."""
    print("\n[4/4] Updating backend configuration...")
    lines = []
    if ENV_FILE.exists():
        with open(ENV_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()

    keys_to_update = {
        'POSTGRES_HOST': host,
        'POSTGRES_PORT': str(port),
        'POSTGRES_DB': dbname,
        'POSTGRES_USER': user,
        'POSTGRES_PASSWORD': password
    }

    updated_keys = set()
    new_lines = []
    for line in lines:
        stripped = line.strip()
        matched_key = None
        for k in keys_to_update:
            if stripped.startswith(f"{k}="):
                matched_key = k
                break
        if matched_key:
            new_lines.append(f"{matched_key}={keys_to_update[matched_key]}\n")
            updated_keys.add(matched_key)
        else:
            new_lines.append(line)

    for k, v in keys_to_update.items():
        if k not in updated_keys:
            new_lines.append(f"{k}={v}\n")

    with open(ENV_FILE, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print(f"[SUCCESS] Saved PostgreSQL configuration into '{ENV_FILE.name}'")

def main():
    parser = argparse.ArgumentParser(description="Create PostgreSQL database and migrate TPS data")
    parser.add_argument("--host", default=getattr(config, 'POSTGRES_HOST', '10.82.126.44'), help="PostgreSQL Server IP/Host")
    parser.add_argument("--port", default=getattr(config, 'POSTGRES_PORT', 5432), type=int, help="PostgreSQL Port")
    parser.add_argument("--dbname", default=getattr(config, 'POSTGRES_DB', ''), help="Target Database Name to create/connect")
    parser.add_argument("--user", default=getattr(config, 'POSTGRES_USER', ''), help="PostgreSQL Username")
    parser.add_argument("--password", default=getattr(config, 'POSTGRES_PASSWORD', ''), help="PostgreSQL Password")
    parser.add_argument("--admin-db", default="postgres", help="Default administrative DB to connect for database creation")

    args = parser.parse_args()

    host = args.host
    port = args.port
    dbname = args.dbname
    user = args.user
    password = args.password

    # Prompt if missing
    if not dbname:
        dbname = input("Enter New Database Name to create (e.g., tps_tiei_db): ").strip()
    if not user:
        user = input("Enter PostgreSQL Username (e.g., postgres): ").strip()
    if not password:
        import getpass
        password = getpass.getpass("Enter PostgreSQL Password (typing hidden): ").strip()

    if not dbname or not user:
        print("[ERROR] Database name and Username are required.")
        sys.exit(1)

    # Step 1: Create database if not exists
    created = create_postgres_database(host, port, user, password, dbname, admin_db=args.admin_db)
    if not created:
        print("[ABORTED] Could not complete PostgreSQL database setup.")
        sys.exit(1)

    # Step 2: Connect to the new database
    print(f"\nConnecting to target database '{dbname}' on {host}:{port}...")
    try:
        pg_conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            dbname=dbname
        )
    except Exception as e:
        print(f"[ERROR] Failed to connect to '{dbname}': {e}")
        sys.exit(1)

    # Step 3: Create schema
    create_tables(pg_conn)

    # Step 4: Migrate data from SQLite
    migrate_sqlite_data(SQLITE_DB_PATH, pg_conn)

    pg_conn.close()

    # Step 5: Save config
    save_env_config(host, port, dbname, user, password)

    print("\n==================================================================")
    print("      POSTGRESQL DATABASE SETUP & MIGRATION COMPLETED!           ")
    print("==================================================================")
    print(f" Database: {dbname}")
    print(f" Host:     {host}:{port}")
    print(f" User:     {user}")
    print(" The application is now fully configured to use PostgreSQL.")
    print("==================================================================\n")

if __name__ == '__main__':
    main()
