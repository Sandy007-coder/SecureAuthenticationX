"""
run.py - Entry point for the SecureAuthX Flask application.
"""

from app import create_app

# Create the Flask application instance
app = create_app()

if __name__ == "__main__":
    # Run the app on localhost with debug mode enabled
    # Debug mode is suitable for development; disable in production
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
