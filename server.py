"""
Chic Shop Galena's - Root Server Runner
Launches the backend server pointing to the frontend modular application.
"""

import os
import sys

# Add backend directory to sys.path
BACKEND_DIR = os.path.join(os.path.dirname(__file__), 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from server import app

if __name__ == '__main__':
    port = 5000
    url = f"http://127.0.0.1:{port}"
    print("=" * 60)
    print("Chic Shop Galena's Store is running at:")
    print(f">> {url} <<")
    print("=" * 60)
    app.run(host='0.0.0.0', port=port, debug=False)
