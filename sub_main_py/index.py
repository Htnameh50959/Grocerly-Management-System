from flask import Flask, redirect, request, session, jsonify, render_template
from pymongo import MongoClient
import bcrypt
import json
import datetime
from flask import Blueprint
from bson import ObjectId
from sub_main_py.db import *

index_bp = Blueprint('index', __name__)
app = Flask(__name__)
app.secret_key = "123456789789456123"


# --------- ROUTES ---------
@index_bp.route('/')
def index():
    return render_template("index.html")


@index_bp.route('/index/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        loginIdentifier = data.get('useroremailin', '').strip()
        password = data.get('passin', '')
        role = data.get('role', '')
        pincode = data.get('pincode', '')
        if not loginIdentifier or not password:
            return jsonify(status="error",
                           message="Username or password cannot be empty.")
        user_doc = users_collection.find_one({
            "$or": [{
                "username": loginIdentifier
            }, {
                "email": loginIdentifier
            }]
        })
        if user_doc:
            stored_hash = user_doc.get("password").encode('utf-8')
            if not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
                return jsonify(status="error", message="Invalid password!")
            username = user_doc.get("username")
            email = user_doc.get("email")
            user_role = user_doc.get("role")
            if user_role != role:
                return jsonify(status="error",
                               message="Invalid role for this user.")
            session["username"] = username
            session["email"] = email
            session["role"] = user_role
            if user_role == "customer":
                session["fullname"] = user_doc.get("fullname")
            elif user_role == "distributor":
                session["role"] = user_role
                distributorname = user_doc.get("distributorname")
                pincode1 = user_doc.get("pincode")
                session["distributorname"] = distributorname
                session["pincode"] = pincode1
                if pincode1 != pincode:
                    return jsonify(status="error",
                                   message="Invalid pincode for this user.")
            elif user_role == "admin":
                session["role"] = user_role
            return jsonify(status="success",
                           message="Login successful!",
                           role=user_role)
        else:
            return jsonify(status="error", message="Username not found!")
    except Exception as e:
        return jsonify(status="error", message=f"An error occurred: {str(e)}")


@index_bp.route('/index/loginornot')
def loginornot():
    username = session.get('username')
    email = session.get('email')
    if username and email:
        return jsonify({"status": "success", "message": "User is logged in."})
    else:
        return jsonify({
            "status": "error",
            "message": "User is not logged in."
        })


@index_bp.route('/index/Register', methods=['POST'])
def Register():
    try:
        data = request.get_json()
        fullname = data.get("registerfullname", "").strip()
        username = data.get("registerUsername", "").strip()
        email = data.get("registerEmail", "").strip()
        password1 = data.get("password1", "")
        password2 = data.get("password2", "")
        if not (fullname and username and email and password1 and password2):
            return jsonify({
                "status": "error",
                "message": "All fields are required"
            })
        if password1 != password2:
            return jsonify({
                "status": "error",
                "message": "Passwords do not match"
            })
        if len(password1) < 8:
            return jsonify({
                "status": "error",
                "message": "Password must be at least 8 characters"
            })
        if users_collection.find_one(
            {"$or": [{
                "username": username
            }, {
                "email": email
            }]}):
            return jsonify({
                "status": "error",
                "message": "User already exists"
            })
        hashed_password = bcrypt.hashpw(password1.encode('utf-8'),
                                        bcrypt.gensalt()).decode('utf-8')
        users_collection.insert_one({
            "fullname": fullname,
            "username": username,
            "email": email,
            "password": hashed_password,
            "role": "customer"
        })
        return jsonify({
            "status": "success",
            "message": "Registration successful"
        })
    except Exception as ex:
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(ex)}"
        })


@index_bp.route('/logout')
def logout():
    # Clear the session
    session.clear()
    # Return JSON response
    result = {"status": "success", "message": "Logged out successfully."}
    return jsonify(result)


@index_bp.route('/index/unauth_logout')
def unauth_logout():
    # Clear the session
    session.clear()


@index_bp.route('/index/GetProducts', methods=['POST'])
def GetProducts():
    data = request.get_json()
    category = data.get('category', '').strip()
    if not category:
        return jsonify(status="error", message="Category cannot be empty.")
    collection = productDB[category]
    products = list(collection.find({}, {'_id': 0}))
    if not products:
        return jsonify(status="error",
                       message="No products found in this category.")
    return jsonify({'products': products})


@index_bp.route('/index/orders', methods=['POST'])
def orders():
    username = session.get('username')
    if not username:
        return jsonify(status="error", message="User not logged in.")
    userorders = list(orders_collection.find({"username": username}))
    for order in userorders:
        order['_id'] = str(order['_id'])
    if not userorders:
        return jsonify(status="success",
                       message="No orders found for this user.")
    return jsonify({'orders': userorders})


@index_bp.route('/index/placeorder', methods=['POST'])
def place_order():
    order_details = request.get_json()
    # Attach session data
    username = session.get('username')
    email = session.get('email')
    if not username or not email:
        return jsonify({'message': 'User not logged in!', 'status': 'error'})
    # Extract and clean necessary fields
    order = {
        'address': order_details.get('address', '').strip(),
        'phone_number': order_details.get('phone_number', '').strip(),
        'pincode': order_details.get('pincode', '').strip(),
        'paymentOption': order_details.get('paymentOption', '').strip(),
        'items': order_details.get('items', {}),  # Should be an object/dict
        'totalPrice': order_details.get('totalPrice', 0),
        'username': username,
        'email': email,
        'status': 'Pending',
        'orderDate': datetime.datetime.utcnow()
    }
    # Insert into MongoDB
    orders_collection.insert_one(order)
    return jsonify({
        'message': 'Order placed successfully!',
        'status': 'success'
    })


@index_bp.route('/index/SearchProducts', methods=['POST'])
def search_products():
    query = request.get_json()
    collection = {
        "Fresh_Produce", "Dairy_Eggs", "Meat_Seafood", "Bakery_Bread",
        "Pantry_Staples", "Beverages", "Frozen_Foods", "Health_Wellness",
        "Household_Cleaning_Supplies", "Personal_Care"
    }
    products = []
    for category in collection:
        product_collection = productDB[category]
        products_in_category = list(
            product_collection.find(
                {"product_name": {
                    "$regex": query["query"],
                    "$options": "i"
                }}, {'_id': 0}))
        products.extend(products_in_category)
    return jsonify(products)


@index_bp.route('/index/submitComplaint', methods=['POST'])
def submit_complaint():
    data = request.get_json()
    username = session.get('username')
    email = session.get('email')
    if not username:
        return jsonify(status="error", message="User not logged in.")
    name = data.get('name')
    message = data.get('message')
    orderid = data.get('orderid')
    if not all([name, email, message, orderid]):
        return jsonify(status="error", message="All fields are required.")
    # Try converting orderid string to ObjectId
    try:
        object_id = ObjectId(orderid)
    except Exception:
        return jsonify(status="error", message="Invalid Order ID format.")
    # Lookup by _id (MongoDB default)
    order_doc = orders_collection.find_one({"_id": object_id})
    if not order_doc:
        return jsonify(status="error", message="Order not found.")
    pincode = order_doc.get("pincode")
    phonenumber = order_doc.get("phone_number")
    if not pincode:
        return jsonify(status="error",
                       message="Pincode not found for this order.")
    complaint = {
        "username": username,
        "email": email,
        "name": name,
        "message": message,
        "orderid": orderid,  # Keep the original string version
        "pincode": pincode,
        "phonenumber": phonenumber,
        "submittedAt": datetime.datetime.now()
    }
    complaints_collection.insert_one(complaint)
    return jsonify(status="success",
                   message="Complaint submitted successfully.")


@index_bp.route('/index/verify_admin_pin', methods=['POST'])
def verify_admin_pin():
    data = request.get_json()
    pin = data.get("pin")

    if not pin:
        return jsonify({
            "status": "error",
            "message": "Admin pin is required"
        }), 400

    # Find the single admin pin document (only one should exist)
    admin_doc = adminpin.find_one({})
    if not admin_doc:
        return jsonify({
            "status": "error",
            "message": "Admin pin not set in DB"
        }), 404

    stored_hash = admin_doc.get("adminpin")
    if not stored_hash or not bcrypt.checkpw(pin.encode('utf-8'),
                                             stored_hash.encode('utf-8')):
        return jsonify({
            "status": "error",
            "message": "Invalid admin pin!"
        }), 401

    return jsonify({
        "success": True,
        "message": "Admin pin verified successfully!"
    })


@index_bp.route('/index/cancel_order', methods=['POST'])
def cancel_order():
    try:
        username = session.get('username')
        if not username:
            return jsonify(status="error", message="User not logged in.")

        data = request.get_json()
        order_id = data.get('orderId')
        cancel_reason = data.get('cancelReason', '').strip()

        if not order_id or not cancel_reason:
            return jsonify(status="error", message="Order ID and cancel reason are required.")

        # Convert string order_id to ObjectId
        try:
            object_id = ObjectId(order_id)
        except Exception:
            return jsonify(status="error", message="Invalid Order ID format.")

        # Find the order
        order_doc = orders_collection.find_one({"_id": object_id, "username": username})
        if not order_doc:
            return jsonify(status="error", message="Order not found or you don't have permission to cancel this order.")

        # Check if order can be cancelled
        if order_doc.get("status") in ["Order Completed", "Cancelled"]:
            return jsonify(status="error", message="This order cannot be cancelled.")

        if order_doc.get("status") not in ["Pending", "Packing"]:
            return jsonify(status="error", message="This order is already in delivery and cannot be cancelled.")

        # Update the order with cancelled status and reason
        update_result = orders_collection.update_one(
            {"_id": object_id, "username": username},
            {
                "$set": {
                    "status": "Cancelled",
                    "cancelReason": cancel_reason,
                    "cancelledAt": datetime.datetime.utcnow()
                }
            }
        )

        if update_result.modified_count > 0:
            return jsonify(status="success", message="Order cancelled successfully.")
        else:
            return jsonify(status="error", message="Failed to cancel order.")

    except Exception as e:
        return jsonify(status="error", message=f"An error occurred: {str(e)}")