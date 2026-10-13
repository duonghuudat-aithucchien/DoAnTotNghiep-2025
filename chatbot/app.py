from flask import Flask, render_template
from flask_cors import CORS

from config import Settings
from application.bootstrap import build_dependencies
from api.routes import register_routes
from infrastructure.observability import configure_logging


def create_app(settings=None, dependencies=None):
    settings = settings or Settings.from_env()
    configure_logging(settings.log_level)
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024
    CORS(
        app, origins=[settings.frontend_url], supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Chat-Session"],
        expose_headers=["X-Request-ID", "Retry-After"],
    )
    dependencies = dependencies or build_dependencies(settings)
    app.extensions["shopping_ai"] = dependencies
    app.config["CHAT_SETTINGS"] = settings
    register_routes(app, dependencies, settings)

    @app.get("/")
    def home():
        return render_template("index.html")

    return app


if __name__ == "__main__":
    # Waitress works on Windows and Linux. Production never uses Flask's dev server.
    from waitress import serve
    application = create_app()
    serve(application, host="0.0.0.0", port=application.config["CHAT_SETTINGS"].port, threads=4)

