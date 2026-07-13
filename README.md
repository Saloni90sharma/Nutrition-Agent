# 🥗 NutriBot — IBM Watsonx.ai Nutrition Agent

An AI-powered nutrition assistant web application built with Python Flask and IBM Watsonx.ai Granite models. Features a full-featured chat UI, personalized meal planning, calorie analysis, BMI calculator, family nutrition profiles, Indian food specialization, and a dark mode UI.

---

## 📁 Project Structure

```
Nutrition_Agent/
│
├── app.py                  ← Flask backend, all API routes
├── agent.py                ← 🔧 AGENT_INSTRUCTIONS + Watsonx.ai integration
├── requirements.txt        ← Python dependencies
├── .env.example            ← Environment variable template
├── .env                    ← Your secrets (never commit this)
│
├── templates/
│   ├── base.html           ← Shared layout (navbar, profile modal, footer)
│   ├── index.html          ← Chat page (main dashboard)
│   ├── nutrition.html      ← Calorie & nutrient analyzer
│   ├── meal_plan.html      ← 7-day personalized meal planner
│   ├── bmi.html            ← BMI calculator + AI advice
│   └── family.html         ← Family profile & unified meal plan
│
└── static/
    ├── css/
    │   └── style.css       ← Full responsive CSS, dark mode, animations
    └── js/
        ├── app.js          ← Core: dark mode, profile, toast, shared utils
        ├── chat.js         ← Chat page logic
        ├── nutrition.js    ← Calorie analyzer logic
        ├── mealplan.js     ← Meal plan generator logic
        ├── bmi.js          ← BMI calculator logic
        └── family.js       ← Family planner logic
```

---

## ⚡ Quick Start

### 1. Prerequisites

| Requirement | Version |
|-------------|---------|
| Python      | 3.10+   |
| pip         | 23+     |

### 2. Clone / Download

```bash
git clone <your-repo-url>
cd Nutrition_Agent
```

### 3. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env        # macOS/Linux
copy .env.example .env      # Windows

# Edit .env with your credentials
```

Open `.env` and fill in:

```env
IBM_API_KEY=your_ibm_cloud_api_key_here
WATSONX_PROJECT_ID=your_watsonx_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-3-3-8b-instruct
FLASK_SECRET_KEY=your-random-32-char-secret-key
```

### 6. Run the App

```bash
python app.py
```

Open your browser at → **http://127.0.0.1:5000**

---

## 🔑 Getting IBM Cloud Credentials

### IBM API Key
1. Log in to [IBM Cloud Console](https://cloud.ibm.com)
2. Go to **Manage → Access (IAM) → API Keys**
3. Click **Create an IBM Cloud API key**
4. Copy the key and add to `.env` as `IBM_API_KEY`

### Watsonx.ai Project ID
1. Go to [Watsonx.ai](https://dataplatform.cloud.ibm.com)
2. Open or create a **Project**
3. Go to **Manage → General → Details**
4. Copy the **Project ID** and add to `.env` as `WATSONX_PROJECT_ID`

### Available Granite Models
| Model ID | Description |
|----------|-------------|
| `ibm/granite-3-3-8b-instruct` | **Default** — balanced speed/quality |
| `ibm/granite-3-8b-instruct` | Full 8B model |
| `ibm/granite-3-2b-instruct` | Lightweight, faster |

---

## 🧠 Customizing the Agent

All agent behavior is configured in **`agent.py`** inside the `AGENT_INSTRUCTIONS` block.

```python
# agent.py — lines ~30–120
AGENT_INSTRUCTIONS = """
You are NutriBot...

━━━━━━━━━━━━━━━
PERSONA & TONE
━━━━━━━━━━━━━━━
• Friendly, warm, encouraging...
• [EDIT THIS to change how the agent speaks]

━━━━━━━━━━━━━━━━━━━
DIETARY SPECIALIZATIONS
━━━━━━━━━━━━━━━━━━━
• [EDIT to add/remove cuisine knowledge]

━━━━━━━━━━━━━━━━━
SAFETY & DISCLAIMER RULES
━━━━━━━━━━━━━━━━━
• [EDIT safety rules here]
"""
```

### Common Customizations

| What to change | Where |
|----------------|-------|
| Agent persona/name | `AGENT_INSTRUCTIONS` → PERSONA section |
| Add a new cuisine | `AGENT_INSTRUCTIONS` → DIETARY SPECIALIZATIONS |
| Change diet defaults | `AGENT_INSTRUCTIONS` → INDIAN FOOD PREFERENCES |
| Stricter safety rules | `AGENT_INSTRUCTIONS` → SAFETY & DISCLAIMER RULES |
| Response language | `AGENT_INSTRUCTIONS` → LANGUAGE section |
| Output format | `AGENT_INSTRUCTIONS` → RESPONSE FORMAT section |
| Model temperature | `.env` → `AGENT_TEMPERATURE` (0.0–1.0) |
| Response length | `.env` → `AGENT_MAX_TOKENS` |

---

## 🌐 Application Features

### 💬 Chat Page (`/`)
- Real-time AI chat with NutriBot
- Markdown-rendered responses with headers, lists, bold text
- Typing indicator animation
- Quick prompt chips for common questions
- Profile sidebar with BMI, calorie target, diet stats
- Clear chat history
- Mobile-responsive with slide-out sidebar

### 🔬 Calorie Analyzer (`/nutrition`)
- Enter any food items or meal description
- Pre-built Indian meal presets (Idli-Sambar, Dal-Roti, etc.)
- Animated macro bars (calories, protein, carbs, fat, fiber)
- Full AI nutritional breakdown
- Nutrition tips section

### 📅 Meal Planner (`/meal-plan`)
- 7-day personalized meal plan generation
- Configurable: goal, diet type, activity level, cuisine, health conditions
- Indian cuisine focus with regional variety
- Calorie counts per meal included
- Copy to clipboard functionality

### ⚖️ BMI Calculator (`/bmi`)
- Instant BMI calculation with animated pointer gauge
- AI-generated personalized nutrition advice based on BMI
- Visual color-coded BMI scale reference
- Asian (Indian) BMI thresholds note

### 👨‍👩‍👧‍👦 Family Planner (`/family`)
- Add unlimited family members with individual profiles
- Roles: Father, Mother, Child, Teenager, Grandparent
- Per-member: diet type, health goals, conditions
- One-click unified family meal plan generation

---

## 🎨 UI Features

- **Dark Mode** — Toggle via moon/sun icon, preference saved in localStorage
- **Responsive** — Full mobile support with Bootstrap 5.3
- **Animations** — Message entrance, typing indicator, BMI pointer, macro bars
- **Floating Navbar** — Sticky with active link highlighting
- **Toast Notifications** — Non-intrusive success/error feedback
- **Markdown Rendering** — Via marked.js for rich formatted AI responses
- **Profile Modal** — Quick access profile setup from any page

---

## 🚀 Production Deployment

### Option 1: Gunicorn (Linux/macOS)

```bash
# Install
pip install gunicorn

# Run
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# With environment file
gunicorn -w 4 -b 0.0.0.0:5000 --env FLASK_ENV=production app:app
```

### Option 2: IBM Cloud Code Engine

```bash
# Build Docker image
docker build -t nutribot .
docker tag nutribot icr.io/<namespace>/nutribot:latest
docker push icr.io/<namespace>/nutribot:latest

# Deploy to Code Engine
ibmcloud ce application create \
  --name nutribot \
  --image icr.io/<namespace>/nutribot:latest \
  --env-from-secret nutribot-secrets \
  --port 5000
```

### Option 3: Dockerfile

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "app:app"]
```

### Environment Variables for Production

```env
FLASK_ENV=production
FLASK_DEBUG=False
FLASK_SECRET_KEY=<strong-random-64-char-key>
```

---

## 🔒 Security Notes

- ✅ `.env` file is never committed (add to `.gitignore`)
- ✅ Flask sessions are HTTP-only and SameSite=Lax
- ✅ API keys are loaded only from environment variables
- ✅ User input is validated before sending to the API
- ✅ Session data is limited to 20 chat turns

### Recommended `.gitignore`

```gitignore
.env
__pycache__/
*.pyc
venv/
.venv/
*.egg-info/
dist/
build/
.DS_Store
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `IBM_API_KEY is not set` | Copy `.env.example` to `.env` and fill in your key |
| `Authentication failed (401)` | Verify your IBM_API_KEY is active and correct |
| `Rate limit (429)` | Wait a minute, or upgrade your IBM Cloud plan |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` in your venv |
| `Port 5000 in use` | Change `FLASK_PORT=5001` in `.env` |
| Chat responses empty | Check `AGENT_MAX_TOKENS` is ≥ 512 in `.env` |

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `Flask 3.0` | Web framework |
| `ibm-watsonx-ai 1.1` | IBM Watsonx.ai SDK |
| `python-dotenv` | `.env` file loading |
| `gunicorn` | Production WSGI server |

**Frontend CDN (no install needed):**
- Bootstrap 5.3 — UI components
- Bootstrap Icons 1.11 — Icon set
- Marked.js — Markdown rendering
- Google Fonts Inter + Poppins

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Powered by IBM Watsonx.ai · Granite Models · Built with ❤️ for healthy living*
