"""Flask adapter for the existing AI-Sports-Coach services."""

import os
import sys
import uuid
from pathlib import Path

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename


BASE_DIR = Path(__file__).resolve().parent
SPORTS_COACH_DIR = BASE_DIR.parent / "AI-Sports-Coach"
UPLOAD_DIR = BASE_DIR / "uploads"
ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}
MAX_UPLOAD_SIZE = 200 * 1024 * 1024

if str(SPORTS_COACH_DIR) not in sys.path:
    sys.path.insert(0, str(SPORTS_COACH_DIR))

ai_coach_api = Blueprint("ai_coach_api", __name__, url_prefix="/api")


def _error(message, status):
    return jsonify({"detail": message, "error": message}), status


def _uploaded_file():
    file = request.files.get("file")
    if file is None or not file.filename:
        return None, _error("A video file is required.", 400)

    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        return None, _error(
            "Unsupported video format. Use MP4, AVI, MOV or MKV.", 400
        )
    return file, None


def _save_video(file):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{Path(file.filename).suffix.lower()}"
    path = UPLOAD_DIR / secure_filename(filename)
    total_size = 0
    with path.open("wb") as destination:
        while True:
            chunk = file.stream.read(1024 * 1024)
            if not chunk:
                break
            total_size += len(chunk)
            if total_size > MAX_UPLOAD_SIZE:
                path.unlink(missing_ok=True)
                raise ValueError("Video is too large. Maximum allowed size is 200 MB.")
            destination.write(chunk)
    return path


def _backend_services():
    """Import ML services only when an analysis request is made."""
    from backend.services.analysis_service import analyze_football_video
    from backend.services.athletics_service import analyze_athletics_video
    from backend.services.basketball_service import analyze_basketball_video
    from backend.services.progress_service import (
        get_progress_data,
        get_user_history,
        save_performance_result,
    )
    from backend.features.badminton_features import extract_badminton_features
    from backend.sports.badminton import analyze_badminton
    from backend.vision.pose_analyzer import PoseAnalyzer

    return {
        "football": analyze_football_video,
        "athletics": analyze_athletics_video,
        "basketball": analyze_basketball_video,
        "badminton_features": extract_badminton_features,
        "badminton": analyze_badminton,
        "PoseAnalyzer": PoseAnalyzer,
        "get_progress_data": get_progress_data,
        "get_user_history": get_user_history,
        "save_performance_result": save_performance_result,
    }


def _run_analysis(sport, user_id, file):
    path = _save_video(file)
    services = _backend_services()
    try:
        if sport == "badminton":
            analyzer = services["PoseAnalyzer"](target_fps=5)
            try:
                pose = analyzer.analyze_video(str(path))
            finally:
                analyzer.close()
            if pose["processed_frames"] < 3:
                raise ValueError("The video does not contain enough usable frames.")
            if pose["pose_detected_frames"] == 0:
                raise ValueError("No usable human pose was detected in the video.")
            if pose["detection_rate"] < 0.30:
                raise ValueError(
                    "Pose detection quality is too low. Use a clearer video where "
                    "the player is visible."
                )
            analysis = services["badminton"](
                services["badminton_features"](pose["landmarks"])
            )
            analysis["pose_quality"] = {
                "total_video_frames": pose["total_frames"],
                "processed_frames": pose["processed_frames"],
                "pose_detected_frames": pose["pose_detected_frames"],
                "detection_rate": pose["detection_rate"],
                "original_fps": pose["original_fps"],
                "analysis_fps": pose["target_fps"],
            }
        else:
            analyzer = services[sport]
            analysis = analyzer(str(path), target_fps=5)

        analysis["saved_performance"] = services["save_performance_result"](
            user_id=user_id,
            sport=sport,
            analysis_result=analysis,
        )
        return analysis
    finally:
        path.unlink(missing_ok=True)


@ai_coach_api.post("/upload-video")
def upload_video():
    file, error = _uploaded_file()
    if error:
        return error
    try:
        path = _save_video(file)
        return jsonify({
            "success": True,
            "message": "Video uploaded successfully",
            "original_filename": file.filename,
            "stored_filename": path.name,
        })
    except ValueError as exc:
        return _error(str(exc), 413)
    finally:
        if "path" in locals():
            path.unlink(missing_ok=True)


@ai_coach_api.post("/analyze/<sport>")
def analyze_video(sport):
    sport = sport.lower()
    if sport == "running":
        sport = "athletics"
    if sport not in {"badminton", "football", "athletics", "basketball"}:
        return _error(
            "This sport is not supported by the AI-Sports-Coach backend. "
            "Supported sports: Football, Badminton, Basketball and Running.",
            400,
        )
    file, error = _uploaded_file()
    if error:
        return error
    user_id = request.form.get("user_id", "browser-athlete").strip()
    if not user_id:
        return _error("user_id is required.", 400)
    try:
        return jsonify(_run_analysis(sport, user_id, file))
    except ValueError as exc:
        return _error(str(exc), 422)
    except Exception as exc:
        return _error(f"{sport.title()} analysis failed: {exc}", 500)


@ai_coach_api.get("/history/<user_id>")
def user_history(user_id):
    try:
        history = _backend_services()["get_user_history"](user_id=user_id)
        return jsonify({"user_id": user_id, "total_records": len(history), "history": history})
    except Exception as exc:
        return _error(f"Could not load history: {exc}", 500)


@ai_coach_api.get("/history/<user_id>/<sport>")
def user_sport_history(user_id, sport):
    try:
        history = _backend_services()["get_user_history"](
            user_id=user_id, sport=sport
        )
        return jsonify({
            "user_id": user_id,
            "sport": sport,
            "total_records": len(history),
            "history": history,
        })
    except Exception as exc:
        return _error(f"Could not load history: {exc}", 500)


@ai_coach_api.get("/progress/<user_id>/<sport>")
def user_progress(user_id, sport):
    try:
        progress = _backend_services()["get_progress_data"](
            user_id=user_id, sport=sport
        )
        return jsonify(progress)
    except Exception as exc:
        return _error(f"Could not load progress: {exc}", 500)
