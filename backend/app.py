from flask import Flask, request, jsonify, make_response, send_from_directory
from flask_cors import CORS
import requests
import ssl
import urllib3
import os
from datetime import datetime, timedelta
from config import config
from session_manager import session_manager

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__, 
           static_folder='../flutter_app/build/web',
           static_url_path='')
CORS(app, supports_credentials=True)

def api_response(success=True, data=None, error=None):
    response = {'success': success}
    if data is not None:
        response['data'] = data
    if error is not None:
        response['error'] = error
    return response

def get_session_from_token():
    # Check Authorization header for token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, {'success': False, 'error': 'No active session'}, 401
    
    session_id = auth_header.replace('Bearer ', '')
    session = session_manager.get_session(session_id)
    if not session:
        return None, {'success': False, 'error': 'Session expired'}, 401
    
    return session, None, None

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        database = data.get('database')
        environment = data.get('environment')
        
        if not all([username, password, database]):
            return jsonify(api_response(False, error='Missing required fields')), 400
        
        payload = {
            'UserName': username,
            'Password': password,
            'CompanyDB': database
        }
        
        response = requests.post(
            f"{config.service_layer_url}/Login",
            json=payload,
            verify=False
        )
        
        if not response.ok:
            return jsonify(api_response(False, error=f'Authentication failed: {response.text}')), 401
        
        sap_response = response.json()
        session_timeout = sap_response.get('SessionTimeout', 30)
        expires_at = datetime.now() + timedelta(minutes=session_timeout)
        
        session_data = {
            'sessionId': sap_response['SessionId'],
            'username': username,
            'environment': environment,
            'version': sap_response.get('Version', ''),
            'timeout': session_timeout,
            'expiresAt': expires_at
        }
        
        session_manager.store_session(session_data)
        
        # Return session token in response body for Flutter to store
        return jsonify(api_response(True, {
            'token': session_data['sessionId'],
            'username': session_data['username'],
            'environment': session_data['environment'],
            'timeout': session_data['timeout']
        }))
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify(api_response(False, error='Login failed')), 400

@app.route('/api/logout', methods=['POST'])
def logout():
    try:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            session_id = auth_header.replace('Bearer ', '')
            session_manager.remove_session(session_id)
        
        return jsonify(api_response(True))
        
    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify(api_response(False, error='Logout failed')), 500

@app.route('/api/session', methods=['GET'])
def get_session():
    try:
        session, error_response, status_code = get_session_from_token()
        if error_response:
            return jsonify(error_response), status_code
        
        time_remaining = (session['expiresAt'] - datetime.now()).total_seconds() / 60
        
        return jsonify(api_response(True, {
            'sessionId': session['sessionId'],
            'username': session['username'],
            'environment': session['environment'],
            'timeout': session['timeout'],
            'timeRemaining': int(time_remaining)
        }))
        
    except Exception as e:
        print(f"Session check error: {e}")
        return jsonify(api_response(False, error='Session check failed')), 500

@app.route('/api/business-partners', methods=['GET'])
def get_business_partners():
    try:
        session, error_response, status_code = get_session_from_token()
        if error_response:
            return jsonify(error_response), status_code
        
        response = requests.get(
            f"{config.service_layer_url}/BusinessPartners?$select=CardCode,CardName,CardType,Valid,CurrentAccountBalance,Currency&$top=50",
            headers={'Cookie': f"B1SESSION={session['sessionId']}"},
            verify=False
        )
        
        if not response.ok:
            return jsonify(api_response(False, error=f'Failed to fetch business partners: {response.text}')), response.status_code
        
        sap_data = response.json()
        return jsonify(api_response(True, sap_data.get('value', [])))
        
    except Exception as e:
        print(f"Business partners fetch error: {e}")
        return jsonify(api_response(False, error='Failed to fetch business partners')), 500

@app.route('/api/items', methods=['GET'])
def get_items():
    try:
        session, error_response, status_code = get_session_from_token()
        if error_response:
            return jsonify(error_response), status_code
        
        response = requests.get(
            f"{config.service_layer_url}/Items?$select=ItemCode,ItemName,ItemType,Valid,QuantityOnStock&$top=50",
            headers={'Cookie': f"B1SESSION={session['sessionId']}"},
            verify=False
        )
        
        if not response.ok:
            return jsonify(api_response(False, error=f'Failed to fetch items: {response.text}')), response.status_code
        
        sap_data = response.json()
        return jsonify(api_response(True, sap_data.get('value', [])))
        
    except Exception as e:
        print(f"Items fetch error: {e}")
        return jsonify(api_response(False, error='Failed to fetch items')), 500

@app.route('/api/sales-orders', methods=['GET'])
def get_sales_orders():
    try:
        session, error_response, status_code = get_session_from_token()
        if error_response:
            return jsonify(error_response), status_code
        
        response = requests.get(
            f"{config.service_layer_url}/Orders?$select=DocEntry,DocNum,CardCode,CardName,DocDate,DocTotal,DocumentStatus&$top=50",
            headers={'Cookie': f"B1SESSION={session['sessionId']}"},
            verify=False
        )
        
        if not response.ok:
            return jsonify(api_response(False, error=f'Failed to fetch sales orders: {response.text}')), response.status_code
        
        sap_data = response.json()
        return jsonify(api_response(True, sap_data.get('value', [])))
        
    except Exception as e:
        print(f"Sales orders fetch error: {e}")
        return jsonify(api_response(False, error='Failed to fetch sales orders')), 500

@app.route('/api/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    try:
        session, error_response, status_code = get_session_from_token()
        if error_response:
            return jsonify(error_response), status_code
        
        headers = {'Cookie': f"B1SESSION={session['sessionId']}"}
        
        partners_response = requests.get(
            f"{config.service_layer_url}/BusinessPartners/$count",
            headers=headers,
            verify=False
        )
        items_response = requests.get(
            f"{config.service_layer_url}/Items/$count",
            headers=headers,
            verify=False
        )
        orders_response = requests.get(
            f"{config.service_layer_url}/Orders/$count",
            headers=headers,
            verify=False
        )
        
        total_partners = int(partners_response.text) if partners_response.ok else 0
        active_items = int(items_response.text) if items_response.ok else 0
        open_orders = int(orders_response.text) if orders_response.ok else 0
        
        time_remaining_min = int((session['expiresAt'] - datetime.now()).total_seconds() / 60)
        hours = time_remaining_min // 60
        minutes = time_remaining_min % 60
        session_time_remaining = f"{hours}:{str(minutes).zfill(2)}"
        
        stats = {
            'totalPartners': total_partners,
            'activeItems': active_items,
            'openOrders': open_orders,
            'sessionTimeRemaining': session_time_remaining
        }
        
        return jsonify(api_response(True, stats))
        
    except Exception as e:
        print(f"Dashboard stats fetch error: {e}")
        return jsonify(api_response(False, error='Failed to fetch dashboard stats')), 500

@app.route('/api/databases', methods=['GET'])
def get_databases():
    try:
        print("Loading databases from config.json")
        databases = config.get_databases_list()
        print(f"Available databases: {databases}")
        return jsonify(api_response(True, databases))
        
    except Exception as e:
        print(f"Failed to load databases from config: {e}")
        return jsonify(api_response(False, error='Failed to load available databases')), 500

@app.route('/api/locations', methods=['GET'])
def get_locations():
    try:
        session, error_response, status_code = get_session_from_token()
        if error_response:
            return jsonify(error_response), status_code
        
        response = requests.get(
            f"{config.service_layer_url}/Locations?$top=100",
            headers={'Cookie': f"B1SESSION={session['sessionId']}"},
            verify=False
        )
        
        if not response.ok:
            return jsonify(api_response(False, error=f'Failed to fetch locations: {response.text}')), response.status_code
        
        sap_data = response.json()
        return jsonify(api_response(True, sap_data.get('value', [])))
        
    except Exception as e:
        print(f"Locations fetch error: {e}")
        return jsonify(api_response(False, error='Failed to fetch locations')), 500

@app.route('/api/branches', methods=['GET'])
def get_branches():
    try:
        session, error_response, status_code = get_session_from_token()
        if error_response:
            return jsonify(error_response), status_code
        
        response = requests.get(
            f"{config.service_layer_url}/Branches?$top=100",
            headers={'Cookie': f"B1SESSION={session['sessionId']}"},
            verify=False
        )
        
        if not response.ok:
            return jsonify(api_response(False, error=f'Failed to fetch branches: {response.text}')), response.status_code
        
        sap_data = response.json()
        
        mapped_data = [
            {
                'Code': branch.get('Code'),
                'Name': branch.get('Name'),
                'Description': branch.get('Name'),
                'Disabled': branch.get('Disabled'),
                'Address': branch.get('Street'),
                'City': branch.get('City'),
                'Country': branch.get('Country')
            }
            for branch in sap_data.get('value', [])
        ]
        
        return jsonify(api_response(True, mapped_data))
        
    except Exception as e:
        print(f"Branches fetch error: {e}")
        return jsonify(api_response(False, error='Failed to fetch branches')), 500

@app.route('/api/warehouses', methods=['GET'])
def get_warehouses():
    try:
        session, error_response, status_code = get_session_from_token()
        if error_response:
            return jsonify(error_response), status_code
        
        response = requests.get(
            f"{config.service_layer_url}/Warehouses?$top=100",
            headers={'Cookie': f"B1SESSION={session['sessionId']}"},
            verify=False
        )
        
        if not response.ok:
            return jsonify(api_response(False, error=f'Failed to fetch warehouses: {response.text}')), response.status_code
        
        sap_data = response.json()
        
        mapped_data = [
            {
                'WhsCode': wh.get('WarehouseCode'),
                'WhsName': wh.get('WarehouseName'),
                'Location': wh.get('Location'),
                'Inactive': wh.get('Inactive'),
                'Locked': wh.get('Locked'),
                'Address': wh.get('Street'),
                'Country': wh.get('Country'),
                'City': wh.get('City'),
                'BinActivat': wh.get('BinActivat')
            }
            for wh in sap_data.get('value', [])
        ]
        
        return jsonify(api_response(True, mapped_data))
        
    except Exception as e:
        print(f"Warehouses fetch error: {e}")
        return jsonify(api_response(False, error='Failed to fetch warehouses')), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    try:
        config_data = {
            'serviceLayerUrl': config.service_layer_url,
            'defaultUser': config.default_user,
            'supportedEnvironments': ['HANA', 'MSSQL'],
            'sessionTimeout': 30,
            'databaseCount': len(config.databases)
        }
        
        return jsonify(api_response(True, config_data))
        
    except Exception as e:
        print(f"Config fetch error: {e}")
        return jsonify(api_response(False, error='Failed to fetch configuration')), 500

# Serve Flutter web app
@app.route('/')
def serve_flutter():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_flutter_files(path):
    if path.startswith('api/'):
        return jsonify(api_response(False, error='Not found')), 404
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = 5000
    print(f"Starting Flask server on port {port}")
    print("API endpoints available at http://0.0.0.0:5000/api/*")
    app.run(host='0.0.0.0', port=port, debug=True)
