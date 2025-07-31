from flask import Blueprint, Flask, jsonify, request, render_template, session
from datetime import datetime, timedelta
from bson import ObjectId
from pymongo import MongoClient
import bcrypt
from sub_main_py.db import *


admin_bp = Blueprint('admin', __name__)
app = Flask(__name__)
app.secret_key = "123456789789456123"

# --------- ROUTES ---------


@admin_bp.route('/admin')
def admin_page():
    username = session.get('username')
    if not username:
        return jsonify({"status": "error", "message": "User not logged in"}), 401
    user_doc = users_collection.find_one({"username": username})
    if not user_doc:
        return jsonify({"status": "error", "message": "User not found"}), 404
    user_doc_role = user_doc.get("role")
    if user_doc_role != "admin":
        return render_template("error.html", message="Unauthorized access. " )
    return render_template("admin.html")
# --------- Get Orders Route ---------


@admin_bp.route('/admin/get_orders', methods=['POST'])
def get_orders():
    
    try:
        orders_cursor = orders_collection.find()
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
    
@admin_bp.route('/admin/TodayOrders', methods=['POST'])
def today_orders():
   
    try:
        # Get today's date range (UTC assumed)
        today = datetime.utcnow().date()
        start = datetime(today.year, today.month, today.day)
        end = start + timedelta(days=1)
        # Query today's orders for the current distributor's pincode
        orders_cursor = orders_collection.find({
            "orderDate": {
                "$gte": start,
                "$lt": end
            }
        })
        if orders_cursor is None:
            return jsonify({"status": "error", "message": "No orders found"}), 404
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
@admin_bp.route('/admin/UpdateOrderStatus', methods=['POST'])
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
@admin_bp.route('/admin/DeleteOrder', methods=['POST'])
def delete_order():
    data = request.get_json()
    order_id = data.get("orderId")
    if not order_id:
        return jsonify({"status": "error", "message": "Order ID missing"}), 400
    orders_collection.delete_one({"_id": ObjectId(order_id)})
    return jsonify({"status": "success"})
@admin_bp.route('/admin/get_complaints', methods=['POST'])
def complaints():
    
    complaints_cursor = complaints_collection.find()
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

@admin_bp.route('/admin/GetUser', methods=['POST'])
def get_users():
    data = request.get_json()
    role = data.get("role")
    if not role:
        return jsonify({"status": "error", "message": "Role is required"}), 400
    users_cursor = users_collection.find({"role": role})
    users = []
    for doc in users_cursor:
        doc["_id"] = str(doc["_id"])  # Convert ObjectId to string
        users.append(doc)
    
    return jsonify({
        "status": "success",
        "users": users
    })
@admin_bp.route('/admin/Deleteuser', methods=['POST'])
def delete_user():  
    data = request.get_json()
    user_id = data.get("userId")
    if not user_id:
        return jsonify({"status": "error", "message": "User ID is required"}), 400
    users_collection.delete_one({"_id": ObjectId(user_id)})
    return jsonify({"status": "success", "message": "User deleted successfully"})
@admin_bp.route('/admin/GetDashboardStats', methods=['POST'])
def get_dashboard_stats():
    try:
        # Total users
        total_users = users_collection.count_documents({})

        # Breakdown by role
        customer_count = users_collection.count_documents({"role": "customer"})
        distributor_count = users_collection.count_documents({"role": "distributor"})

        # Orders and revenue
        total_orders = orders_collection.count_documents({})
        total_revenue = sum(order.get("totalPrice", 0) for order in orders_collection.find())
 
        # Orders grouped by status
        pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        orders_status_group = orders_collection.aggregate(pipeline)
        orders_by_status = {item["_id"]: item["count"] for item in orders_status_group}

         # Today's date range
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)

        # Count of today's orders
        todays_orders = orders_collection.count_documents({
            "order_date": {"$gte": today, "$lt": tomorrow}
        })
        # Complaints
        total_complaints = complaints_collection.count_documents({})
        return jsonify({
            "status": "success",
            "data": {
                "total_users": total_users,
                "customer_count": customer_count,
                "distributor_count": distributor_count,
                "total_orders": total_orders,
                "total_revenue": total_revenue,
                "ordersByStatus": orders_by_status,
                "totalcomplaints": total_complaints,
                "today_orders": todays_orders

            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": "Internal server error"}), 500


@admin_bp.route('/admin/AddUser', methods=['POST'])
def add_user():
    try:
        data = request.get_json()
        userData = data.get("userData")

        password = userData.get("password", "")
        if not password:
            return jsonify({"status": "error", "message": "Password is required"})

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        user_record = {
            "username": userData.get("username", ""),
            "email": userData.get("email", ""),
            "distributorname": userData.get("distributorname", ""),
            "pincode": userData.get("pincode", ""),
            "fullname": userData.get("fullname", ""),
            "role": userData.get("role", ""),
            "password": hashed_password
        }

        users_collection.insert_one(user_record)
        return jsonify({"status": "success", "message": "User added successfully"})

    except Exception as e:
        return jsonify({"status": "error", "message": f"Error adding user: {str(e)}"})

@admin_bp.route('/admin/verify_admin_pin', methods=['POST'])
def verify_admin_pin():
    data = request.get_json()
    pin = data.get("pin")

    if not pin:
        return jsonify({"status": "error", "message": "Admin pin is required"}), 400

    # Find the single admin pin document (only one should exist)
    admin_doc = adminpin.find_one({})
    if not admin_doc:
        return jsonify({"status": "error", "message": "Admin pin not set in DB"}), 404

    stored_hash = admin_doc.get("adminpin")
    if not stored_hash or not bcrypt.checkpw(pin.encode('utf-8'), stored_hash.encode('utf-8')):
        return jsonify({"status": "error", "message": "Invalid admin pin!"}), 401

    return jsonify({"success": True, "message": "Admin pin verified successfully!"})
