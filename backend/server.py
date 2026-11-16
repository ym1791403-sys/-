"""
Chic Shop Galena's - Backend Server
Provides local web hosting and order API endpoints.
"""

import sys
import os
import json
from datetime import datetime
from flask import Flask, send_from_directory, request, jsonify

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
ORDERS_FILE = os.path.join(DATA_DIR, 'orders.json')

app = Flask(__name__, static_folder=FRONTEND_DIR)

def load_orders():
    if os.path.exists(ORDERS_FILE):
        try:
            with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_orders(orders):
    with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(orders, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    # Check inside frontend directory
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    # Fallback to base directory if requested
    if os.path.exists(os.path.join(BASE_DIR, path)):
        return send_from_directory(BASE_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/api/orders', methods=['GET', 'POST'])
def handle_orders():
    if request.method == 'POST':
        order_data = request.get_json(silent=True) or {}
        order_data['received_at'] = datetime.now().isoformat()
        orders = load_orders()
        orders.insert(0, order_data)
        save_orders(orders)
        return jsonify({"status": "success", "message": "Order saved successfully", "order": order_data}), 201
    else:
        return jsonify(load_orders())

@app.route('/api/health')
def health():
    return jsonify({
        "status": "ok",
        "app": "Chic Shop Galena's Store Server",
        "time": datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = 5000
    url = f"http://127.0.0.1:{port}"
    print("=" * 60)
    print("Chic Shop Galena's Store Server is running at:")
    print(f">> {url} <<")
    print("=" * 60)
    app.run(host='0.0.0.0', port=port, debug=False)
