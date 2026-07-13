"""
╔══════════════════════════════════════════════════════════════════╗
║           NUTRITION AGENT — FLASK BACKEND (app.py)             ║
╚══════════════════════════════════════════════════════════════════╝
"""

import os
import json
from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    session,
)
from dotenv import load_dotenv
from agent import (
    chat_with_agent,
    generate_meal_plan,
    analyze_calories,
    calculate_bmi_advice,
    get_family_plan,
)

# ──────────────────────────────────────────────────────────────
#  App Initialization
# ──────────────────────────────────────────────────────────────
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-change-in-production")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

# ──────────────────────────────────────────────────────────────
#  Helper: Session Utilities
# ──────────────────────────────────────────────────────────────
def get_chat_history() -> list:
    return session.get("chat_history", [])


def save_chat_history(history: list) -> None:
    session["chat_history"] = history[-20:]   # keep last 20 turns


def get_user_profile() -> dict:
    return session.get("user_profile", {})


def save_user_profile(profile: dict) -> None:
    session["user_profile"] = profile


def get_family_members() -> list:
    return session.get("family_members", [])


def save_family_members(members: list) -> None:
    session["family_members"] = members


# ──────────────────────────────────────────────────────────────
#  Page Routes
# ──────────────────────────────────────────────────────────────
@app.route("/")
def index():
    """Main dashboard / chat page."""
    return render_template(
        "index.html",
        profile=get_user_profile(),
        history=get_chat_history(),
        family=get_family_members(),
    )


@app.route("/meal-plan")
def meal_plan_page():
    return render_template("meal_plan.html", profile=get_user_profile())


@app.route("/bmi")
def bmi_page():
    return render_template("bmi.html", profile=get_user_profile())


@app.route("/family")
def family_page():
    return render_template("family.html", family=get_family_members())


@app.route("/nutrition")
def nutrition_page():
    return render_template("nutrition.html", profile=get_user_profile())


# ──────────────────────────────────────────────────────────────
#  API Routes — Chat
# ──────────────────────────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def api_chat():
    """Handle a single chat turn."""
    data = request.get_json(silent=True) or {}
    user_message = (data.get("message") or "").strip()

    if not user_message:
        return jsonify({"error": "Message cannot be empty."}), 400

    history = get_chat_history()
    profile = get_user_profile()

    reply = chat_with_agent(user_message, history=history, user_profile=profile)

    # Persist turn
    history.append({"role": "user", "content": user_message})
    history.append({"role": "assistant", "content": reply})
    save_chat_history(history)

    return jsonify({"reply": reply, "history_length": len(history)})


@app.route("/api/chat/clear", methods=["POST"])
def api_chat_clear():
    save_chat_history([])
    return jsonify({"status": "cleared"})


# ──────────────────────────────────────────────────────────────
#  API Routes — Profile
# ──────────────────────────────────────────────────────────────
@app.route("/api/profile", methods=["GET"])
def api_get_profile():
    return jsonify(get_user_profile())


@app.route("/api/profile", methods=["POST"])
def api_save_profile():
    data = request.get_json(silent=True) or {}
    allowed_fields = {
        "name", "age", "gender", "weight", "height",
        "goal", "diet_type", "activity_level",
        "health_conditions", "allergies", "cuisine_preference",
    }
    profile = {k: str(v).strip() for k, v in data.items() if k in allowed_fields and v}
    save_user_profile(profile)
    return jsonify({"status": "saved", "profile": profile})


# ──────────────────────────────────────────────────────────────
#  API Routes — Meal Plan
# ──────────────────────────────────────────────────────────────
@app.route("/api/meal-plan", methods=["POST"])
def api_meal_plan():
    data = request.get_json(silent=True) or {}
    profile = {**get_user_profile(), **data}      # merge session profile + form data
    if not profile:
        return jsonify({"error": "Please complete your profile first."}), 400

    plan = generate_meal_plan(profile)
    return jsonify({"plan": plan})


# ──────────────────────────────────────────────────────────────
#  API Routes — Calorie Analysis
# ──────────────────────────────────────────────────────────────
@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    data = request.get_json(silent=True) or {}
    food_items = (data.get("food_items") or "").strip()
    if not food_items:
        return jsonify({"error": "Please provide food items to analyze."}), 400

    analysis = analyze_calories(food_items)
    return jsonify({"analysis": analysis})


# ──────────────────────────────────────────────────────────────
#  API Routes — BMI
# ──────────────────────────────────────────────────────────────
@app.route("/api/bmi", methods=["POST"])
def api_bmi():
    data = request.get_json(silent=True) or {}
    try:
        weight = float(data.get("weight", 0))
        height = float(data.get("height", 0))
        age    = int(data.get("age", 25))
        gender = str(data.get("gender", "person"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid input values."}), 400

    if weight <= 0 or height <= 0:
        return jsonify({"error": "Weight and height must be positive numbers."}), 400

    advice, bmi_value, category = calculate_bmi_advice(weight, height, age, gender)
    return jsonify({"bmi": bmi_value, "category": category, "advice": advice})


# ──────────────────────────────────────────────────────────────
#  API Routes — Family
# ──────────────────────────────────────────────────────────────
@app.route("/api/family", methods=["GET"])
def api_get_family():
    return jsonify(get_family_members())


@app.route("/api/family/member", methods=["POST"])
def api_add_family_member():
    data = request.get_json(silent=True) or {}
    members = get_family_members()
    member = {
        "id": len(members) + 1,
        "name": data.get("name", "Member"),
        "age": data.get("age", ""),
        "gender": data.get("gender", ""),
        "role": data.get("role", "family member"),
        "diet_type": data.get("diet_type", ""),
        "health_conditions": data.get("health_conditions", ""),
        "goal": data.get("goal", ""),
    }
    members.append(member)
    save_family_members(members)
    return jsonify({"status": "added", "member": member, "total": len(members)})


@app.route("/api/family/member/<int:member_id>", methods=["DELETE"])
def api_remove_family_member(member_id: int):
    members = [m for m in get_family_members() if m.get("id") != member_id]
    save_family_members(members)
    return jsonify({"status": "removed", "total": len(members)})


@app.route("/api/family/plan", methods=["POST"])
def api_family_plan():
    members = get_family_members()
    if not members:
        return jsonify({"error": "No family members added yet."}), 400
    plan = get_family_plan(members)
    return jsonify({"plan": plan})


# ──────────────────────────────────────────────────────────────
#  API Routes — Quick Suggestions
# ──────────────────────────────────────────────────────────────
QUICK_PROMPTS = [
    "What should I eat for breakfast today?",
    "Give me a high-protein vegetarian lunch idea.",
    "What Indian foods help with weight loss?",
    "Is dal-chawal a complete protein? Explain.",
    "Suggest a healthy evening snack under 150 calories.",
    "What are the best superfoods in Indian cuisine?",
    "How much water should I drink daily?",
    "Give me a diabetic-friendly Indian dinner recipe.",
]


@app.route("/api/quick-prompts")
def api_quick_prompts():
    return jsonify(QUICK_PROMPTS)


# ──────────────────────────────────────────────────────────────
#  Error Handlers
# ──────────────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found."}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error."}), 500


# ──────────────────────────────────────────────────────────────
#  Entry Point
# ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    print(f"""
╔══════════════════════════════════════════════════════════╗
║         🥗  IBM Watsonx.ai Nutrition Agent  🥗          ║
╚══════════════════════════════════════════════════════════╝
  Local:    http://127.0.0.1:{port}
  Network:  http://0.0.0.0:{port}
  Debug:    {debug}
  Model:    {os.getenv("WATSONX_MODEL_ID", "ibm/granite-3-3-8b-instruct")}
══════════════════════════════════════════════════════════""")
    app.run(host="0.0.0.0", port=port, debug=debug)
