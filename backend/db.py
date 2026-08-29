import os
import logging
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

load_dotenv()

logger = logging.getLogger(__name__)

uri = os.getenv("MONGODB_URI")

client = None
db = None
listings_collection = None
feedback_collection = None
users_collection = None

if uri:
    try:
        client = MongoClient(uri, server_api=ServerApi('1'), serverSelectionTimeoutMS=10000, connectTimeoutMS=10000)
        db = client["market_risk_detector"]
        listings_collection = db["listings"]
        feedback_collection = db["feedback"]
        users_collection = db["users"]
        users_collection.create_index("email", unique=True)
    except Exception as e:
        logger.warning(f"MongoDB connection failed to initialize: {e}")
        client = db = listings_collection = feedback_collection = users_collection = None


def create_user(email: str, password_hash: str):
    return users_collection.insert_one({
        "email": email,
        "password_hash": password_hash
    })


def find_user_by_email(email: str):
    return users_collection.find_one({"email": email})