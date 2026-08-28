import os
from routes.auth import auth_bp
from flask import Flask
from flask_cors import CORS
from config import Config
from routes.submit import submit_bp
from routes.feedback import feedback_bp
from routes.meta import meta_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allowed origins logic
    allowed_origins = os.environ.get("FRONTEND_URL")
    
    if allowed_origins:
        # Supports comma-separated list for multiple origins (e.g., prod + preview domains)
        origins_list = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]
    else:
        # Fallback for local development or prior to frontend deployment
        origins_list = ["http://localhost:3000", "http://127.0.0.1:5000", "http://localhost:5173"]

    # Configure CORS with explicit preflight handling
    CORS(app, resources={
        r"/api/*": {
            "origins": origins_list,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Register blueprints
    app.register_blueprint(submit_bp, url_prefix='/api')
    app.register_blueprint(feedback_bp, url_prefix='/api')
    app.register_blueprint(meta_bp, url_prefix='/api')

    @app.route('/api/health', methods=['GET'])
    def health():
        return {"status": "ok", "service": "Marketplace Risk Detector API"}, 200

    return app


app = create_app()
app.register_blueprint(auth_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=Config.PORT, debug=True)
