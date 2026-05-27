"""
app/__init__.py - Flask application factory.
Configures Flask app, registers blueprints, CORS, rate limiter, and security headers.
"""

import os
from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

from app.database.db import init_db

# Load environment variables from .env file
load_dotenv()

# Initialize the rate limiter (attached to the app later)
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["10000 per day", "1000 per hour"]
)


def create_app():
    """
    Application factory function.
    Creates and configures the Flask application instance.
    """
    app = Flask(__name__)

    # ----------------------------------------------------------------
    # App Configuration
    # ----------------------------------------------------------------
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback-secret-key")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-jwt-secret")

    # ----------------------------------------------------------------
    # Initialize Extensions
    # ----------------------------------------------------------------

    # Enable Cross-Origin Resource Sharing
    # supports_credentials=True is required for HTTP-only cookies to be sent
    CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

    # Attach rate limiter to the app
    limiter.init_app(app)

    # ----------------------------------------------------------------
    # Initialize Database
    # ----------------------------------------------------------------
    init_db()

    # ----------------------------------------------------------------
    # Register Blueprints
    # ----------------------------------------------------------------
    from app.routes.auth_routes import auth_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # ----------------------------------------------------------------
    # Apply Security Headers to Every Response
    # ----------------------------------------------------------------
    @app.after_request
    def apply_security_headers(response):
        """
        Adds HTTP security headers to every outgoing response.
        These headers help protect against common web vulnerabilities.
        """
        # Prevent browsers from MIME-type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking attacks
        response.headers["X-Frame-Options"] = "DENY"

        # Enable browser XSS filter
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Enforce HTTPS in production (safe to include in development too)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # Restrict referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Control browser features
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # Content Security Policy to restrict resource loading
        response.headers["Content-Security-Policy"] = "default-src 'self'"

        return response
    
    @app.route("/")
    def home():
        return {
            "success": True,
            "message": "SecureAuthX Backend Running"
        }

    return app
