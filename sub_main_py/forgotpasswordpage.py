from flask import Blueprint, render_template, request, jsonify
import random
import time
from datetime import datetime, timedelta
from pymongo import MongoClient
import bcrypt
from sub_main_py.db import *



forgotpassword_bp = Blueprint('forgotpassword', __name__)


# Route to render the Forgot Password page
@forgotpassword_bp.route('/forgotpasswordpage')
def forgotpasswordpage():
    return render_template("forgotpasswordpage.html")

#
otp_storage = {}  # {user/email: {"otp": 123456, "expires_at": datetime}}

@forgotpassword_bp.route('/forgotpassword', methods=['POST'])
def forgotpassword():
    data = request.get_json()
    user_or_email = data.get("useroremailin", "")

    user_doc = users_collection.find_one({
        "$or": [
            {"username": user_or_email},
            {"email": user_or_email}
        ]
    })

    if not user_doc:
        return jsonify(status="error", message="User not found.")

    otp = random.randint(1000, 9999)
    time.sleep(1)

    if user_or_email:
        # Store OTP with 5-minute expiry
        otp_storage[user_or_email] = {
            "otp": str(otp),
            "expires_at": datetime.now() + timedelta(minutes=5)
        }
        # TODO: Send email logic here
        return jsonify(status="success", message=f"The OTP is {otp}")
    else:
        return jsonify(status="error", message="Please enter a valid username or email.")

@forgotpassword_bp.route('/verifyotp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    user_or_email = data.get("useroremailin", "")
    entered_otp = data.get("otp", "")

    stored = otp_storage.get(user_or_email)
    if not stored:
        return jsonify(status="error", message="No OTP found. Please request again.")

    if datetime.now() > stored["expires_at"]:
        return jsonify(status="error", message="OTP expired. Please request a new one.")

    if entered_otp == stored["otp"]:
        return jsonify(status="success", message="OTP verified successfully")
    else:
        return jsonify(status="error", message="Invalid OTP")
    
@forgotpassword_bp.route('/resetpassword', methods=['POST'])
def reset_password():
    data = request.get_json()
    user_or_email = data.get("useroremailin", "").strip()
    new_password = data.get("newpassword", "").strip()

    if not user_or_email or not new_password:
        return jsonify(status="error", message="Username or password cannot be empty.")

    # Check if user exists
    user_doc = users_collection.find_one({
        "$or": [
            {"username": user_or_email},
            {"email": user_or_email}
        ]
    })

    if not user_doc:
        return jsonify(status="error", message="User not found.")

    # Hash the new password
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Update the password in the database
    result = users_collection.update_one(
        {"_id": user_doc["_id"]},
        {"$set": {"password": hashed_password}}
    )

    if result.modified_count == 0:
        return jsonify(status="error", message="Failed to update password.")

    # Remove OTP after success
    if user_or_email in otp_storage:
        del otp_storage[user_or_email]

    return jsonify(status="success", message="Password reset successfully.")


@forgotpassword_bp.route('/resendotp', methods=['POST'])
def resend_otp():
    data = request.get_json()
    user_or_email = data.get("useroremailin", "")

    if not user_or_email:
        return jsonify(status="error", message="Username or email is required.")

    # Generate a new OTP
    otp = random.randint(1000, 9999)
    otp_storage[user_or_email] = {
        "otp": str(otp),
        "expires_at": datetime.now() + timedelta(minutes=5)
    }

    # TODO: Add actual email sending logic here
    return jsonify(status="success", message=f"New OTP sent successfully. OTP is {otp}")
