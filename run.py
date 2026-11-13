#!/usr/bin/env python3
"""
Toyota Industries Engine India (TIEI) - GD Division
TPS Competency Development, Certification & Learning Management System
Live Application Entry Point
"""
import os
import sys

# Set directory paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')
sys.path.insert(0, BACKEND_DIR)

from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("=" * 70)
    print("  TOYOTA INDUSTRIES ENGINE INDIA (TIEI) - GD DIVISION")
    print("  TPS Competency Development & Learning Management System")
    print(f"  Live Application running on: http://127.0.0.1:{port}")
    print("=" * 70)
    app.run(host='127.0.0.1', port=port, debug=False)
