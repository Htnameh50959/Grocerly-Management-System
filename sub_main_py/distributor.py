from flask import Blueprint, Flask, jsonify, request, render_template
from pymongo import MongoClient
from flask import session 
from bson.objectid import ObjectId
from datetime import datetime 
from flask import jsonify, request, session
from datetime import datetime, timedelta
from sub_main_py.db import *


distributor_bp = Blueprint('distributor', __name__)
app = Flask(__name__)
app.secret_key = "12345789789456123"

# --------- ROUTES ---------
@distributor_bp.route('/distributor')
def distributor_page():
    username = session.get('username') 
    
    if not username:
        return jsonify({"status": "error", "message": "User not logged in"}), 401
    user_doc = users_collection.find_one({"username": username})
    if not user_doc:
        return jsonify({"status": "error", "message": "User not found"}), 404
    user_doc_role = user_doc.get("role")
    if user_doc_role != "distributor":
        return render_template("error.html", message="Unauthorized access. " )
    return render_template("distributor.html")
# --------- Get Orders Route ---------
@distributor_bp.route('/distributor/get_orders', methods=['POST'])
def get_orders():
    session_pincode = session.get('pincode')
    if not session_pincode:
        return jsonify({
            "status": "error",
            "message": "Pincode not found in session."
        }), 400
    try:
        orders_cursor = orders_collection.find({"pincode": session_pincode})
        orders = []
        for doc in orders_cursor:
            formatted_order = {}
            for key, value in doc.items():
                if key == "_id":
                    formatted_order[key] = str(value)
                elif isinstance(value, datetime):
                    formatted_order[key] = value.isoformat()
                else:
                    formatted_order[key] = value
            orders.append(formatted_order)
        return jsonify({"status": "success", "orders": orders})
    except Exception as e:
        return jsonify({"status": "error", "message": "Internal server error."}), 500
@distributor_bp.route('/distributor/TodayOrders', methods=['POST'])
def today_orders():
    session_pincode = session.get('pincode')
    if not session_pincode:
        return jsonify({
            "status": "error",
            "message": "Pincode not found in session."
        }), 400
    try:
        # Get today's date range (UTC assumed)
        today = datetime.utcnow().date()
        start = datetime(today.year, today.month, today.day)
        end = start + timedelta(days=1)
        # Query today's orders for the current distributor's pincode
        orders_cursor = orders_collection.find({
            "pincode": session_pincode,
            "orderDate": {
                "$gte": start,
                "$lt": end
            }
        })
        if orders_cursor is None:
            return jsonify({"status": "error", "message": "No orders found"}), 
        orders = []
        for doc in orders_cursor:
            order = {}
            for key, value in doc.items():
                if key == "_id":
                    order[key] = str(value)
                elif isinstance(value, datetime):
                    order[key] = value.isoformat()
                else:
                    order[key] = value
            orders.append(order)
        return jsonify({"status": "success", "orders": orders})
    except Exception as e:
        return jsonify({"status": "error", "message": "Internal server error"}), 
# --------- Update Order Status ---------
@distributor_bp.route('/distributor/update_order_status', methods=['POST'])
def update_order_status():
    data = request.get_json()
    order_id = data.get("orderId")
    status = data.get("status")
    if not order_id or not status:
        return jsonify({"status": "error", "message": "Invalid data"}), 400
    orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": status}}
    )
    return jsonify({"status": "success"})
# --------- Delete Order ---------
@distributor_bp.route('/distributor/delete_order', methods=['POST'])
def delete_order():
    data = request.get_json()
    order_id = data.get("orderId")
    if not order_id:
        return jsonify({"status": "error", "message": "Order ID missing"}), 400
    orders_collection.delete_one({"_id": ObjectId(order_id)})
    return jsonify({"status": "success"})
@distributor_bp.route('/distributor/get_complaints', methods=['POST'])
def complaints():
    session_pincode = session.get("pincode")
    if not session_pincode:
        return jsonify({
            "status": "error",
            "message": "Pincode not found in session."
        }), 400
    complaints_cursor = complaints_collection.find({"pincode": session_pincode})
    complaints = []
    for doc in complaints_cursor:
        doc["_id"] = str(doc["_id"])  # Convert ObjectId to string
        if "date" in doc and isinstance(doc["date"], datetime):
            doc["date"] = doc["date"].strftime("%Y-%m-%d %H:%M")  # Format date
        complaints.append(doc)
    return jsonify({
        "status": "success",
        "complaints": complaints
    })




