import os
import logging

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from app.database.db import init_db, health_check

load_dotenv()

logger = logging.getLogger(__name__)


limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["10000 per day", "1000 per hour"],
    storage_uri=os.getenv("RATELIMIT_STORAGE_URI", "memory://"),
)


_default_origins = "http://localhost:3000,http://127.0.0.1:3000"
ALLOWED_CORS_ORIGINS = tuple(
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", _default_origins).split(",")
    if origin.strip()
)

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Content-Security-Policy": "default-src 'self'",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
}

REQUIRED_ENV_VARS = (
    "SECRET_KEY",
    "JWT_SECRET_KEY",
    "JWT_REFRESH_SECRET_KEY",
)


def _validate_environment(app: Flask) -> None:
    """
    Fail fast on startup if critical secrets are missing or insecure.
    A misconfigured production deployment should never start silently.
    """
    missing = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]

    if missing:
        raise RuntimeError(
            f"Missing required environment variables: {', '.join(missing)}. "
            "Set these in your .env file before starting the server."
        )

    if app.config["ENV"] == "production":
        weak_values = {"fallback-secret-key", "fallback-jwt-secret", "changeme", "secret"}
        for var in REQUIRED_ENV_VARS:
            if os.getenv(var, "").lower() in weak_values:
                raise RuntimeError(
                    f"{var} is set to an insecure default value. "
                    "Use a strong random secret in production."
                )


def create_app() -> Flask:
    app = Flask(__name__)

    app.config.update(
        ENV=os.getenv("FLASK_ENV", "production"),
        DEBUG=os.getenv("FLASK_DEBUG", "false").lower() == "true",
        SECRET_KEY=os.getenv("SECRET_KEY"),
        JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY"),
        JSON_SORT_KEYS=False,
        MAX_CONTENT_LENGTH=2 * 1024 * 1024,  # 2 MB max request body
    )

    _validate_environment(app)

    _configure_logging(app)

    CORS(
        app,
        supports_credentials=True,
        origins=list(ALLOWED_CORS_ORIGINS),
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    )

    limiter.init_app(app)

    init_db()

    _register_blueprints(app)
    _register_error_handlers(app)
    _register_health_routes(app)

    @app.after_request
    def apply_security_headers(response):
        response.headers.update(SECURITY_HEADERS)
        return response

    logger.info(
        "SecureAuthenticationX backend initialized | env=%s | debug=%s",
        app.config["ENV"], app.config["DEBUG"],
    )

    return app


def _configure_logging(app: Flask) -> None:
    log_level = logging.DEBUG if app.config["DEBUG"] else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    )


def _register_blueprints(app: Flask) -> None:
    from app.routes.admin_routes import admin_bp
    from app.routes.auth_routes import auth_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")


def _register_health_routes(app: Flask) -> None:
    @app.route("/")
    def home():
        return jsonify({
            "success": True,
            "message": "SecureAuthX Backend Running",
            "version": "2.0.0",
        })

    @app.route("/health")
    def health():
        db_status = health_check()
        is_healthy = db_status["status"] == "healthy"

        return jsonify({
            "success": is_healthy,
            "service": "SecureAuthX API",
            "database": db_status,
        }), 200 if is_healthy else 503


def _register_error_handlers(app: Flask) -> None:
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "message": "Bad request."}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"success": False, "message": "Authentication required."}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"success": False, "message": "Access denied."}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Resource not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"success": False, "message": "Method not allowed."}), 405

    @app.errorhandler(413)
    def payload_too_large(error):
        return jsonify({"success": False, "message": "Request body too large."}), 413

    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        return jsonify({
            "success": False,
            "message": "Too many requests. Please slow down and try again shortly.",
        }), 429

    @app.errorhandler(500)
    def internal_error(error):
        logger.error("Unhandled server error: %s", error)
        return jsonify({"success": False, "message": "An unexpected error occurred."}), 500