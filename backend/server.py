"""
Chic Shop Galena's - Backend Server
Provides local web hosting and order API endpoints.
"""

import sys
import os
import re
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
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024  # 1 MB max request body

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

@app.route('/privacy')
@app.route('/terms')
@app.route('/returns')
def privacy_page():
    return send_from_directory(FRONTEND_DIR, 'privacy.html')

@app.route('/<path:path>')
def static_files(path):
    # Serve ONLY files inside the frontend directory. Never fall back to
    # the repository root: that used to expose backend/data/orders.json
    # (customer names, phones, addresses), server source and .git files.
    if path.startswith('.') or '/.' in path:
        return jsonify({"error": "Not found"}), 404
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/api/orders', methods=['POST'])
def handle_orders():
    # Local fallback order storage. Listing orders is NOT exposed here:
    # the admin panel reads orders from Firestore, and an open GET
    # endpoint used to leak every customer's name, phone and address.
    order_data = request.get_json(silent=True)
    if not isinstance(order_data, dict):
        return jsonify({"status": "error", "message": "Invalid order data"}), 400
    customer = order_data.get('customer') or {}
    items = order_data.get('items')
    errors = []
    if not isinstance(customer.get('name'), str) or not customer['name'].strip():
        errors.append('customer name is required')
    phone = re.sub(r'\D', '', str(customer.get('phone') or ''))
    if not re.fullmatch(r'01\d{9}', phone):
        errors.append('a valid Egyptian phone number is required')
    if not isinstance(customer.get('address'), str) or not customer['address'].strip():
        errors.append('customer address is required')
    if not isinstance(items, list) or len(items) == 0 or len(items) > 50:
        errors.append('order must contain 1-50 items')
    if errors:
        return jsonify({"status": "error", "message": "; ".join(errors)}), 400
    order_data = {
        'orderNumber': str(order_data.get('orderNumber') or '')[:20],
        'customer': {
            'name': customer['name'].strip()[:100],
            'phone': phone,
            'altPhone': str(customer.get('altPhone') or '')[:20],
            'city': str(customer.get('city') or '')[:60],
            'address': customer['address'].strip()[:300],
            'notes': str(customer.get('notes') or '')[:300],
        },
        'items': items[:50],
        'subtotal': order_data.get('subtotal'),
        'shippingCost': order_data.get('shippingCost'),
        'grandTotal': order_data.get('grandTotal'),
        'status': 'جديد',
        'received_at': datetime.now().isoformat(),
    }
    orders = load_orders()
    orders.insert(0, order_data)
    save_orders(orders[:500])
    return jsonify({"status": "success", "message": "Order saved successfully", "order": order_data}), 201

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
    app.run(host='127.0.0.1', port=port, debug=False)
