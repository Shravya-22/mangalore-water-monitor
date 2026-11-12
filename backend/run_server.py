"""
Mangaluru Water Intelligence API Server Launcher
------------------------------------------------
Initializes database if needed and starts Uvicorn server on configurable host and port.
Compatible with local environments and cloud platforms (Render, Railway, Fly.io).
"""

import os
import sys
import uvicorn

# Add project root and backend to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))

    print("=" * 70)
    print("STARTING MANGALURU WATER INTELLIGENCE BACKEND API")
    print(f"Listening on: http://{host}:{port}")
    print(f"Interactive Swagger Docs: http://{host}:{port}/docs")
    print("=" * 70)

    # Use 'api.main:app' since current_dir is added to sys.path
    uvicorn.run("api.main:app", host=host, port=port, reload=False)

