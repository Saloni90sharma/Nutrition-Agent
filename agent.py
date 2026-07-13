"""
╔══════════════════════════════════════════════════════════════════╗
║              NUTRITION AGENT — AGENT INSTRUCTIONS               ║
║         IBM Watsonx.ai + Granite Integration Module             ║
╚══════════════════════════════════════════════════════════════════╝

 ┌─────────────────────────────────────────────────────────────┐
 │  CUSTOMIZATION GUIDE                                        │
 │  Edit AGENT_INSTRUCTIONS below to shape the agent's:       │
 │   • Persona & tone                                          │
 │   • Dietary specializations (Indian food, vegan, keto …)   │
 │   • Safety & disclaimer rules                               │
 │   • Response format preferences                             │
 │   • Cultural & regional food knowledge                      │
 └─────────────────────────────────────────────────────────────┘
"""

import os
from dotenv import load_dotenv
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

load_dotenv()

# ════════════════════════════════════════════════════════════════
#  AGENT INSTRUCTIONS  ← customize everything here
# ════════════════════════════════════════════════════════════════
AGENT_INSTRUCTIONS = """
You are NutriBot, an expert AI Nutrition Agent powered by IBM Watsonx.ai.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONA & TONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Friendly, warm, and encouraging — like a knowledgeable friend who is a registered dietitian.
• Use simple, jargon-free language. Explain technical terms when you use them.
• Be motivational: celebrate small wins, never shame food choices.
• Keep responses concise but thorough. Use bullet points and sections for readability.
• Address the user by their first name when provided.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIETARY SPECIALIZATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Deeply knowledgeable about Indian cuisine: regional dishes, spices, cooking methods.
  - North Indian: dal makhani, roti, sabzi, paneer dishes, chole, rajma.
  - South Indian: idli, dosa, sambar, rasam, rice-based meals, coconut curries.
  - East Indian: fish curry, mustard-based dishes, rasgulla.
  - West Indian: dhokla, thepla, pav bhaji, Goan curries.
• Fluent in vegetarian, vegan, Jain (no root vegetables), and sattvic diets.
• Familiar with fasting patterns: Navratri, Ekadashi, Ramadan, intermittent fasting.
• Understands Ayurvedic principles: Vata/Pitta/Kapha balance, seasonal eating.
• Covers global diets: Mediterranean, keto, paleo, DASH, low-FODMAP, gluten-free.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NUTRITION CAPABILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Calculate approximate calories, macros (protein, carbs, fat, fiber) for any meal.
• Provide micronutrient highlights (iron, calcium, vitamin D, B12, folate).
• Generate personalized meal plans (daily/weekly) based on: age, weight, height,
  activity level, health goals, medical conditions, and food preferences.
• Suggest healthy Indian and global recipe alternatives that preserve cultural flavors.
• Advise on meal timing, portion sizes, hydration, and mindful eating.
• Support family nutrition: adapt plans for children (2–12), teens, adults, seniors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEALTH GOALS SUPPORTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Weight loss / weight gain / weight maintenance
• Muscle building and athletic performance
• Managing diabetes (Type 1 & 2) — low glycemic index focus
• Heart health — low sodium, low saturated fat, high omega-3
• PCOS / hormonal balance — anti-inflammatory, low-GI
• Thyroid support — iodine-rich, selenium, avoiding goitrogens
• Bone health — calcium, vitamin D, magnesium
• Gut health — probiotics, prebiotics, fiber
• Pregnancy & lactation — folate, iron, DHA
• Child nutrition — growth-supporting, nutrient-dense

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAFETY & DISCLAIMER RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ALWAYS recommend consulting a registered dietitian or doctor for medical nutrition therapy.
• NEVER diagnose medical conditions or replace professional medical advice.
• When a user mentions a serious medical condition (kidney disease, cancer, eating disorder),
  emphasize the importance of professional guidance prominently.
• For children under 2, always say "Please consult your pediatrician."
• Do not recommend extreme caloric restriction (below 1200 kcal for women, 1500 kcal for men).
• Flag potentially dangerous supplement interactions when relevant.
• If a user expresses signs of disordered eating, respond with compassion and professional resources.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• For meal plans: use structured sections (Breakfast / Morning Snack / Lunch / Evening Snack / Dinner).
• For calorie analysis: list food item → portion → calories → key nutrients.
• For recipe suggestions: include ingredients list and brief cooking method.
• For general advice: use numbered steps or bullet points.
• End responses with an actionable tip or motivational line when appropriate.
• Use emoji sparingly to make responses visually friendly (🥗 🍎 💪 ✅).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INDIAN FOOD PREFERENCES (DEFAULT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Prefer suggesting Indian staples first, then offer global alternatives.
• Acknowledge that most Indian home cooking is naturally nutritious.
• Appreciate the use of turmeric (anti-inflammatory), cumin, coriander, ginger, garlic.
• Understand "dal-chawal" as a complete protein source (lentils + rice).
• Respect cultural and religious food restrictions without judgment.
• Suggest Indian superfoods: moringa (drumstick), amla (Indian gooseberry), ashwagandha,
  tulsi, methi (fenugreek), curry leaves, ghee (in moderation).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LANGUAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Respond in the same language the user writes in.
• If the user mixes Hindi/English (Hinglish), match their style naturally.
• Know common Hindi food terms: sabzi, dal, roti, chawal, mithai, namkeen, etc.
"""
# ════════════════════════════════════════════════════════════════
#  END OF AGENT INSTRUCTIONS
# ════════════════════════════════════════════════════════════════


# ──────────────────────────────────────────────────────────────
#  Watson AI Client
# ──────────────────────────────────────────────────────────────
def _build_credentials() -> Credentials:
    """Build IBM Watsonx.ai credentials from environment variables."""
    api_key = os.getenv("IBM_API_KEY")
    url = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    if not api_key:
        raise EnvironmentError(
            "IBM_API_KEY is not set. Copy .env.example to .env and fill in your credentials."
        )
    return Credentials(url=url, api_key=api_key)


def _get_model() -> ModelInference:
    """Instantiate the Granite model inference client."""
    return ModelInference(
        model_id=os.getenv("WATSONX_MODEL_ID", "ibm/granite-3-3-8b-instruct"),
        credentials=_build_credentials(),
        project_id=(os.getenv("WATSONX_PROJECT_ID") or "").strip() or None,
        params={
            GenParams.MAX_NEW_TOKENS: int(os.getenv("AGENT_MAX_TOKENS", 1024)),
            GenParams.TEMPERATURE: float(os.getenv("AGENT_TEMPERATURE", 0.7)),
            GenParams.TOP_P: float(os.getenv("AGENT_TOP_P", 0.9)),
            GenParams.REPETITION_PENALTY: 1.1,
        },
    )


# ──────────────────────────────────────────────────────────────
#  Prompt Builders
# ──────────────────────────────────────────────────────────────
def _build_system_prompt(user_profile: dict | None = None) -> str:
    """Combine AGENT_INSTRUCTIONS with optional user-profile context."""
    profile_section = ""
    if user_profile:
        profile_section = "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nUSER PROFILE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        for key, val in user_profile.items():
            if val:
                profile_section += f"• {key.replace('_', ' ').title()}: {val}\n"
    return AGENT_INSTRUCTIONS + profile_section


def _format_chat_history(history: list[dict]) -> str:
    """Convert conversation history list to a prompt string."""
    formatted = ""
    for turn in history[-8:]:          # keep last 8 turns to stay within token limits
        role = turn.get("role", "user")
        content = turn.get("content", "")
        if role == "user":
            formatted += f"\n<|user|>\n{content}\n"
        else:
            formatted += f"\n<|assistant|>\n{content}\n"
    return formatted


def build_prompt(
    user_message: str,
    history: list[dict] | None = None,
    user_profile: dict | None = None,
) -> str:
    """Assemble the full Granite-style instruct prompt."""
    system = _build_system_prompt(user_profile)
    chat_ctx = _format_chat_history(history or [])
    prompt = (
        f"<|system|>\n{system}\n"
        f"{chat_ctx}"
        f"\n<|user|>\n{user_message}\n"
        f"<|assistant|>\n"
    )
    return prompt


# ──────────────────────────────────────────────────────────────
#  Public API
# ──────────────────────────────────────────────────────────────
def chat_with_agent(
    user_message: str,
    history: list[dict] | None = None,
    user_profile: dict | None = None,
) -> str:
    """
    Send a message to the Nutrition Agent and return the response text.

    Args:
        user_message:  The user's latest message.
        history:       List of previous turns [{role, content}, …].
        user_profile:  Optional profile dict (name, age, weight, goal …).

    Returns:
        Agent's response as a string.
    """
    try:
        model = _get_model()
        prompt = build_prompt(user_message, history, user_profile)
        response = model.generate_text(prompt=prompt)
        return response.strip() if response else "I'm sorry, I couldn't generate a response. Please try again."
    except EnvironmentError as exc:
        return f"⚠️ Configuration Error: {exc}"
    except Exception as exc:                          # noqa: BLE001
        error_msg = str(exc)
        if "authentication" in error_msg.lower() or "401" in error_msg:
            return "⚠️ Authentication failed. Please verify your IBM_API_KEY in the .env file."
        if "quota" in error_msg.lower() or "429" in error_msg:
            return "⚠️ API rate limit reached. Please wait a moment and try again."
        return f"⚠️ Agent error: {error_msg}"


def generate_meal_plan(profile: dict) -> str:
    """Generate a structured weekly meal plan for the given profile."""
    name = profile.get("name", "you")
    age = profile.get("age", "adult")
    weight = profile.get("weight", "")
    height = profile.get("height", "")
    goal = profile.get("goal", "balanced nutrition")
    diet_type = profile.get("diet_type", "vegetarian")
    conditions = profile.get("health_conditions", "none")
    activity = profile.get("activity_level", "moderate")
    cuisine = profile.get("cuisine_preference", "Indian")

    message = (
        f"Create a detailed 7-day meal plan for {name}. "
        f"Profile: Age {age}, Weight {weight} kg, Height {height} cm, "
        f"Activity level: {activity}, Goal: {goal}, Diet type: {diet_type}, "
        f"Health conditions: {conditions}, Cuisine preference: {cuisine}. "
        "Include: breakfast, morning snack, lunch, evening snack, dinner. "
        "Add approximate calories and key macros for each meal. "
        "Make it practical, delicious, and easy to prepare at home."
    )
    return chat_with_agent(message, user_profile=profile)


def analyze_calories(food_items: str) -> str:
    """Analyze calories and nutrition for a list of food items."""
    message = (
        f"Analyze the nutritional content of: {food_items}. "
        "For each item provide: estimated portion size, calories, protein (g), "
        "carbohydrates (g), fat (g), fiber (g), and key micronutrients. "
        "Then give a total summary and whether this is a balanced meal."
    )
    return chat_with_agent(message)


def calculate_bmi_advice(weight_kg: float, height_cm: float, age: int, gender: str) -> str:
    """Return BMI category with personalized nutrition advice."""
    bmi = weight_kg / ((height_cm / 100) ** 2)
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25.0:
        category = "Normal weight"
    elif bmi < 30.0:
        category = "Overweight"
    else:
        category = "Obese"

    message = (
        f"A {age}-year-old {gender} has a BMI of {bmi:.1f} ({category}). "
        f"Weight: {weight_kg} kg, Height: {height_cm} cm. "
        "Provide: (1) What this BMI means for their health, "
        "(2) Ideal weight range, "
        "(3) Daily calorie target range, "
        "(4) Top 5 specific nutrition recommendations, "
        "(5) Suggested Indian foods that support their goal. "
        "Be encouraging and practical."
    )
    return chat_with_agent(message), round(bmi, 1), category


def get_family_plan(members: list[dict]) -> str:
    """Generate a unified family nutrition plan."""
    members_desc = "; ".join(
        f"{m.get('name', 'Member')} (age {m.get('age')}, {m.get('role', 'family member')})"
        for m in members
    )
    message = (
        f"Create a family nutrition plan for: {members_desc}. "
        "Design meals that work for everyone — considering different age groups and needs. "
        "Suggest one unified dinner and customizations for each member where needed. "
        "Focus on Indian home-cooked meals that are easy to prepare together. "
        "Include tips for picky eaters and ensuring children get their nutrients."
    )
    return chat_with_agent(message)
