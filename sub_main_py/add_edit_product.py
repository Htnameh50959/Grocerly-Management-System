from flask import Blueprint, Flask, jsonify, request, render_template, session
from pymongo import MongoClient
import os
import base64
import uuid
from flask import request, jsonify, current_app
from bson.objectid import ObjectId
from sub_main_py.db import *

add_edit_product_bp = Blueprint('add_edit_product', __name__)
app = Flask(__name__)
app.secret_key = '123456789789456123'

# --------- ROUTES ---------
@add_edit_product_bp.route('/add_edit_product')
def addproduct_page():
    username = session.get('username').strip()
    role = session.get('role')
    if not username:
        return jsonify({"status": "error", "message": "User not logged in"}), 401
    user_doc = users_collection.find_one({"username": username})
    if not user_doc:
        return jsonify({"status": "error", "message": "User not found"}), 404
    user_doc_role = user_doc.get("role")
    if user_doc_role != role:
        return render_template("error.html", message="Unauthorized access.", role="User is not an admin")
    return render_template("add_edit_product.html")

@add_edit_product_bp.route('/AddProduct', methods=['POST'])
def add_product():
    try:
        data = request.get_json()
        product_data = data.get("productData", {})

        name = product_data.get("name", "").strip()
        price = product_data.get("price", "").strip()
        category = product_data.get("category", "").strip()
        image_base64 = product_data.get("image", "")
        description = product_data.get("description", "").strip()
        username = session.get('username', '').strip()

        # Basic validation
        if not all([name, price, category, description]):
            return jsonify({"success": False, "message": "All fields are required."}), 400

        image_path = ""

        # Handle image saving
        if image_base64.startswith("data:image"):
            try:
                header, encoded = image_base64.split(",", 1)
                file_ext = header.split("/")[1].split(";")[0]

                filename = f"{name}_{uuid.uuid4()}.{file_ext}"
                image_folder = os.path.join(current_app.root_path, 'static', 'images')
                os.makedirs(image_folder, exist_ok=True)

                image_path = os.path.join('static', 'images', filename)
                file_path = os.path.join(current_app.root_path, image_path)


                with open(file_path, "wb") as image_file:
                    image_file.write(base64.b64decode(encoded))
            except Exception as img_err:
                return jsonify({"success": False, "message": "Failed to save image."}), 500

        # Create product document
        product = {
            "product_name": name,
            "price": price,
            "description": description,
            "image": image_path,
            "added_by": username,

        }

        # Insert into category collection
        try:
            productDB = client["grocery_store"]
            category_collection = productDB[category]
            category_collection.insert_one(product)

            return jsonify({"success": True, "message": f"Product added to {category} collection successfully."})
        except Exception as db_err:
            return jsonify({"success": False, "message": "Failed to add product to database."}), 500

    except Exception as e:
        return jsonify({"success": False, "message": "An unexpected error occurred."}), 500

@add_edit_product_bp.route('/add_edit_product/searchProducts', methods=['POST'])
def search_products():
    data = request.get_json()
    query = data.get("searchTerm", "").strip()
    if not query:
        return jsonify({"status": "error", "message": "Search term cannot be empty."}), 400
    
    collection = {"Fresh_Produce", "Dairy_Eggs", "Meat_Seafood", "Bakery_Bread",
                  "Pantry_Staples", "Beverages", "Frozen_Foods", "Health_Wellness",
                  "Household_Cleaning_Supplies", "Personal_Care"}
    products = []
    for category in collection:
        product_collection = productDB[category]
        # Search with regex, case-insensitive
        results = product_collection.find({
            "product_name": {"$regex": query, "$options": "i"}
        })
        for product in results:
            product['_id'] = str(product['_id']) 
            products.append(product)
    return jsonify(products)
    
@add_edit_product_bp.route('/add_edit_product/updateProduct', methods=['POST'])
def update_product():
    data = request.get_json()
    product_id = data.get('_id')
    name = data.get('product_name')
    price = data.get('price')
    description = data.get('description')
    username = session.get('username', '').strip()

    categories = [
        "Fresh_Produce", "Dairy_Eggs", "Meat_Seafood", "Bakery_Bread",
        "Pantry_Staples", "Beverages", "Frozen_Foods", "Health_Wellness",
        "Household_Cleaning_Supplies", "Personal_Care"
    ]

    for category in categories:
        collection = productDB[category]
        product = collection.find_one({"_id": ObjectId(product_id)})
        if product:
            collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {
                    "product_name": name,
                    "price": price,
                    "description": description,
                    "updated_by": username
                }}
            )
            return jsonify({"success": True})

    return jsonify({"success": False, "error": "Product not found"})
@add_edit_product_bp.route('/add_edit_product/searchProductsByCategory', methods=['POST'])
def search_products_by_category():
    data = request.get_json()
    category = data.get('category', '').strip()

    if not category:
        return jsonify({"status": "error", "message": "Category cannot be empty."}), 400

    if category not in productDB.list_collection_names():
        return jsonify({"status": "error", "message": f"Category '{category}' not found."}), 404

    collection = productDB[category]
    products = []

    for product in collection.find({}):
        product['_id'] = str(product['_id'])  # Convert ObjectId to string
        product['category'] = category        # Include category for frontend
        products.append(product)

    return jsonify(products=products, category=category)


@add_edit_product_bp.route('/add_edit_product/deleteProduct', methods=['POST'])
def delete_product():
    data = request.get_json()
    product_id = data.get('_id')
    category = data.get('category', '')
    if not product_id or not category:
        return jsonify({"status": "error", "message": "Product ID and category are required."}), 400
    if category not in productDB.list_collection_names():
        return jsonify({"status": "error", "message": f"Category '{category}' not found."}), 404
    collection = productDB[category]

    # Fetch the document before deleting
    product = collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        return jsonify({"status": "error", "message": "Product not found."}), 404

    result = collection.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 1:
        # Delete image from static/images if it exists
        image_name = product.get("image", "")
        if image_name:
            image_path = os.path.join(image_name)
            if os.path.exists(image_path):
                os.remove(image_path)
        return jsonify({"status": "success", "message": "Product deleted successfully."})
    else:
        return jsonify({"status": "error", "message": "Failed to delete product."}), 500
    
