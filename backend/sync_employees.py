#!/usr/bin/env python3
"""
TIEI Employee Synchronization CLI Tool
Usage:
    python backend/sync_employees.py --file postman_export.json
    python backend/sync_employees.py --url http://api.internal.tiei.com/employees --token YOUR_TOKEN
"""

import sys
import os
import argparse
import json
import sqlite3

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))
import config
from emp_sync import sync_employees_data, fetch_and_sync_from_api, ensure_sync_columns

DB_PATH = os.path.join(os.path.dirname(__file__), 'tps_database.db')

def main():
    parser = argparse.ArgumentParser(description="Synchronize TIEI Employee API data with TPS Application Database")
    group = parser.add_mutually_exclusive_group(required=False)
    group.add_argument("--file", "-f", help="Path to JSON file containing TIEI employee records (e.g., exported from Postman)")
    group.add_argument("--url", "-u", default=config.TIEI_EMP_API_URL, help="URL of TIEI Employee Details API (defaults to backend/config.py)")

    parser.add_argument("--token", "-t", default=config.TIEI_EMP_API_KEY, help="Bearer token or API key for remote API authentication")
    parser.add_argument("--header", "-H", action="append", help="Custom HTTP headers in 'Key: Value' format")
    parser.add_argument("--db", default=DB_PATH, help="Target SQLite database path")

    args = parser.parse_args()

    if not os.path.exists(args.db):
        print(f"[ERROR] Database file not found at: {args.db}")
        sys.exit(1)

    conn = sqlite3.connect(args.db)
    ensure_sync_columns(conn)

    try:
        if args.file:
            if not os.path.exists(args.file):
                print(f"[ERROR] JSON file not found: {args.file}")
                sys.exit(1)
            print(f"[INFO] Reading records from JSON file: {args.file}...")
            with open(args.file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            result = sync_employees_data(conn, data, source_label=f"File: {os.path.basename(args.file)}")
        else:
            print(f"[INFO] Connecting to external TIEI Employee API: {args.url}...")
            custom_headers = {}
            if args.header:
                for h in args.header:
                    if ':' in h:
                        k, v = h.split(':', 1)
                        custom_headers[k.strip()] = v.strip()

            result = fetch_and_sync_from_api(
                conn,
                api_url=args.url,
                auth_header=args.token,
                custom_headers=custom_headers
            )

        print("\n=======================================================")
        print("          TIEI EMPLOYEE SYNC COMPLETED SUCCESSFULLY     ")
        print("=======================================================")
        print(f" Source:           {result['source']}")
        print(f" Timestamp:        {result['synced_at']}")
        print(f" Total Received:   {result['total_received']}")
        print(f" Valid Processed:  {result['valid_processed']}")
        print(f" New Inserted:     {result['new_inserted']}")
        print(f" Updated:          {result['updated']}")
        print("=======================================================\n")

    except Exception as e:
        print(f"\n[ERROR] Sync failed: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == '__main__':
    main()
