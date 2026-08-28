"""
Flask Configuration settings
"""
import os
import secrets

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'market-risk-detector-secret')
    MONGODB_URI = os.environ.get('MONGODB_URI', '')
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    PORT = int(os.environ.get('PORT', 5000))
    DEBUG = os.environ.get('DEBUG', 'true').lower() == 'true'

    JWT_SECRET = os.environ.get('JWT_SECRET', '')
    if not JWT_SECRET:
        if DEBUG:
            JWT_SECRET = secrets.token_hex(32)
        else:
            raise ValueError("JWT_SECRET environment variable is required")