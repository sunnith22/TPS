"""
TIEI Employee Details API Backend Configuration
Configures external HRMS / ERP API connectivity, auto-synchronization on startup,
periodic background polling, and real-time login resolution.
"""

import os
from pathlib import Path

# Load .env file if present
BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / '.env'
if ENV_FILE.exists():
    with open(ENV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))

# ==============================================================================
# 1. TIEI HRMS / ERP EMPLOYEE DETAILS API SETTINGS
# ==============================================================================
# Set your API endpoint URL here or via TIEI_EMP_API_URL environment variable
TIEI_EMP_API_URL = os.environ.get(
    "TIEI_EMP_API_URL",
    ""  # e.g., "http://10.20.30.40:8080/api/v1/employees" or "https://hrms.tiei.toyota-industries.com/api/employees"
).strip()

# Optional authentication token / API Key (Bearer Token, Basic Auth, or secret key)
TIEI_EMP_API_KEY = os.environ.get("TIEI_EMP_API_KEY", "").strip()

# Optional custom HTTP headers (e.g. '{"X-Plant-Code": "TIEI-GD"}')
TIEI_EMP_API_HEADERS = {}
custom_headers_env = os.environ.get("TIEI_EMP_API_HEADERS", "").strip()
if custom_headers_env:
    import json
    try:
        TIEI_EMP_API_HEADERS = json.loads(custom_headers_env)
    except Exception:
        pass

# Timeout for API HTTP requests in seconds
API_TIMEOUT_SECONDS = int(os.environ.get("TIEI_EMP_API_TIMEOUT", "15"))

# ==============================================================================
# 2. AUTOMATIC SYNCHRONIZATION BEHAVIORS
# ==============================================================================
# Automatically fetch and sync employee data when the backend starts up
AUTO_SYNC_ON_STARTUP = os.environ.get("AUTO_SYNC_ON_STARTUP", "true").lower() in ("true", "1", "yes")

# Run periodic background sync every N hours (0 to disable background scheduler)
BACKGROUND_SYNC_INTERVAL_HOURS = float(os.environ.get("BACKGROUND_SYNC_INTERVAL_HOURS", "4"))

# Real-time resolution: if an employee enters an unknown ID/email at login,
# automatically query the external API in real time to fetch and register them
DYNAMIC_LOGIN_SYNC = os.environ.get("DYNAMIC_LOGIN_SYNC", "true").lower() in ("true", "1", "yes")

# Path to local JSON fallback/cache file (used when remote API is unreachable or in dev)
LOCAL_FALLBACK_FILE = os.environ.get(
    "LOCAL_FALLBACK_FILE",
    str(BASE_DIR / "tiei_employees_cache.json")
)
