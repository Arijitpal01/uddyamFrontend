"""Flask entry point for the Udyam web application."""

from pathlib import Path

from flask import Flask, abort, render_template, send_from_directory

from ai_coach_api import ai_coach_api

BASE_DIR = Path(__file__).resolve().parent
PAGES = {
    "home": "index.html",
    "dashboard": "dashboard.html",
    "ai-coach": "ai-coach.html",
    "workout": "workout.html",
    "nutrition": "nutrition.html",
    "challenges": "challenges.html",
    "profile": "profile.html",
}

app = Flask(
    __name__,
    template_folder=str(BASE_DIR),
    static_folder=None,
)
app.config["MAX_CONTENT_LENGTH"] = 200 * 1024 * 1024
app.register_blueprint(ai_coach_api)


def render_page(page_name: str):
    """Render one of the pages that belongs to the Udyam application."""
    template_name = PAGES.get(page_name)
    if template_name is None:
        abort(404)
    return render_template(template_name)


@app.get("/")
def home():
    return render_page("home")


@app.get("/health")
def health():
    return {"status": "healthy", "service": "udyam"}


def register_page_routes():
    for page_name in PAGES:
        if page_name == "home":
            continue

        app.add_url_rule(
            f"/{page_name}",
            endpoint=f"{page_name}_page",
            view_func=lambda page_name=page_name: render_page(page_name),
        )

        # Keep existing bookmarks and links working while pages are migrated.
        app.add_url_rule(
            f"/{PAGES[page_name]}",
            endpoint=f"{page_name}_legacy_page",
            view_func=lambda page_name=page_name: render_page(page_name),
        )

    app.add_url_rule(
        "/index.html",
        endpoint="home_legacy_page",
        view_func=lambda: render_page("home"),
    )


@app.get("/css/<path:filename>")
def css_asset(filename: str):
    return send_from_directory(BASE_DIR / "css", filename)


@app.get("/js/<path:filename>")
def javascript_asset(filename: str):
    return send_from_directory(BASE_DIR / "js", filename)


register_page_routes()


if __name__ == "__main__":
    app.run(debug=True)
