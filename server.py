"""
AURA Accessories Store - Local Development Server
Provides web hosting and simple order persistence.
"""

import sys

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import os
import json
import webbrowser
from datetime import datetime
from flask import Flask, send_from_directory, request, jsonify

app = Flask(__name__, static_folder='.')

ORDERS_FILE = os.path.join(os.path.dirname(__file__), 'orders.json')

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
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/api/orders', methods=['GET', 'POST'])
def handle_orders():
    if request.method == 'POST':
        order_data = request.json or {}
        order_data['received_at'] = datetime.now().isoformat()
        orders = load_orders()
        orders.insert(0, order_data)
        save_orders(orders)
        return jsonify({"status": "success", "message": "Order saved successfully", "order": order_data}), 201
    else:
        return jsonify(load_orders())

@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "app": "AURA Luxury Accessories Store", "time": datetime.now().isoformat()})

if __name__ == '__main__':
    port = 5000
    url = f"http://127.0.0.1:{port}"
    print("=" * 60)
    print("AURA Accessories Store is running at:")
    print(f">> {url} <<")
    print("=" * 60)
    
    # Optional: Open browser automatically
    try:
        webbrowser.open(url)
    except Exception:
        pass

    app.run(host='0.0.0.0', port=port, debug=False)
