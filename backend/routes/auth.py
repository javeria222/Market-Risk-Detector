import re
import jwt
import bcrypt
import logging
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from pymongo.errors import DuplicateKeyError

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _generate_token(user_id, email):
    payload = {
        "user_id": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")


def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        request.user = payload
        return f(*args, **kwargs)
    return decorated


@auth_bp.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not EMAIL_REGEX.match(email):
        return jsonify({"error": "Invalid email format"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    from db import create_user
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        result = create_user(email, password_hash)
    except DuplicateKeyError:
        return jsonify({"error": "Email already registered"}), 409
    except Exception:
        logger.exception("Signup failed for %s", email)
        return jsonify({"error": "Signup failed, please try again"}), 500

    token = _generate_token(result.inserted_id, email)
    return jsonify({"token": token, "email": email}), 201


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    from db import find_user_by_email
    user = find_user_by_email(email)

    if not user or not bcrypt.checkpw(password.encode(), user['password_hash'].encode()):
        return jsonify({"error": "Invalid email or password"}), 401

    token = _generate_token(user['_id'], email)
    return jsonify({"token": token, "email": email}), 200


@auth_bp.route('/auth/me', methods=['GET'])
@auth_required
def me():
    return jsonify({
        "user_id": request.user["user_id"],
        "email": request.user["email"]
    }), 200