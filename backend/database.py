"""
Database Abstraction Layer for TPS Enterprise Application
Supports Dual-Mode persistence:
1. PostgreSQL (Production corporate network: 10.82.126.44:5432)
2. SQLite (Embedded fallback when offline or in development: backend/tps_database.db)

Automatically translates SQL queries (? to %s) and row formats for seamless cross-database compatibility.
"""

import os
import re
import sqlite3
from pathlib import Path

try:
    import psycopg2
    from psycopg2 import sql
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False

try:
    import config
except ImportError:
    try:
        from . import config
    except ImportError:
        import backend.config as config

BASE_DIR = Path(__file__).resolve().parent
SQLITE_PATH = os.path.join(BASE_DIR, 'tps_database.db')

class PostgresCursorWrapper:
    """Wraps psycopg2 cursor to translate SQLite syntax (?) to PostgreSQL (%s) and provide dict rows."""
    def __init__(self, pg_cursor):
        self._cursor = pg_cursor

    def execute(self, query, params=None):
        # Convert SQLite ? placeholders to PostgreSQL %s placeholders
        pg_query = query.replace('?', '%s')
        
        # Handle datetime('now') -> NOW()
        pg_query = re.sub(r"\bdatetime\('now'\)", "NOW()", pg_query, flags=re.IGNORECASE)
        # Handle last_insert_rowid()
        pg_query = re.sub(r"\blast_insert_rowid\(\)", "LASTVAL()", pg_query, flags=re.IGNORECASE)

        if params is not None:
            if isinstance(params, (list, tuple)):
                self._cursor.execute(pg_query, params)
            else:
                self._cursor.execute(pg_query, (params,))
        else:
            self._cursor.execute(pg_query)
        return self

    def executemany(self, query, seq_of_params):
        pg_query = query.replace('?', '%s')
        pg_query = re.sub(r"\bdatetime\('now'\)", "NOW()", pg_query, flags=re.IGNORECASE)
        self._cursor.executemany(pg_query, seq_of_params)
        return self

    def fetchone(self):
        row = self._cursor.fetchone()
        if row is None:
            return None
        return dict(row)

    def fetchall(self):
        rows = self._cursor.fetchall()
        return [dict(r) for r in rows]

    @property
    def rowcount(self):
        return self._cursor.rowcount

    @property
    def lastrowid(self):
        return getattr(self._cursor, 'lastrowid', None)

    def close(self):
        self._cursor.close()

class PostgresConnectionWrapper:
    """Wraps psycopg2 connection to mimic sqlite3 connection interface."""
    def __init__(self, pg_conn):
        self._conn = pg_conn
        self.is_postgres = True

    def cursor(self):
        return PostgresCursorWrapper(self._conn.cursor(cursor_factory=RealDictCursor))

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()

def get_db():
    """
    Returns an active database connection.
    Connects to PostgreSQL if POSTGRES_HOST & POSTGRES_DB are configured and reachable;
    Otherwise falls back safely to SQLite.
    """
    pg_host = getattr(config, 'POSTGRES_HOST', '').strip()
    pg_db = getattr(config, 'POSTGRES_DB', '').strip()
    pg_user = getattr(config, 'POSTGRES_USER', '').strip()
    pg_pass = getattr(config, 'POSTGRES_PASSWORD', '').strip()
    pg_port = getattr(config, 'POSTGRES_PORT', '5432')

    if PSYCOPG2_AVAILABLE and pg_host and pg_db and pg_user:
        try:
            conn = psycopg2.connect(
                host=pg_host,
                port=pg_port,
                dbname=pg_db,
                user=pg_user,
                password=pg_pass,
                connect_timeout=3
            )
            return PostgresConnectionWrapper(conn)
        except Exception as e:
            print(f"[DATABASE NOTICE] PostgreSQL connection to {pg_host}:{pg_port}/{pg_db} not available ({e}). Using SQLite fallback.")

    # SQLite Fallback
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn
