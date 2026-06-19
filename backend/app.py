import os
import json
import re
from groq import Groq
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# ── Load .env from the same directory as this script ────────────────────────
env_path = os.path.join(os.path.dirname(__file__), '.env')
env_loaded = load_dotenv(env_path)

GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

print("========================================")
print(f"Loading .env from: {env_path}")
print(f".env loaded successfully: {env_loaded}")

if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
    masked = f"{GROQ_API_KEY[:8]}...{GROQ_API_KEY[-4:]}" if len(GROQ_API_KEY) > 12 else "TOO_SHORT"
    print(f"Groq API Key Status : FOUND ({masked})")
else:
    print("Groq API Key Status : MISSING — add GROQ_API_KEY to .env")
    GROQ_API_KEY = None

print(f"Groq Model          : {GROQ_MODEL}")
print("========================================")

# ── Flask app ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── System prompt — strictly JSON output ─────────────────────────────────────
SYSTEM_PROMPT = """You are an AI Final Year Project Idea Generator.
When a user asks for project ideas for a domain, respond with EXACTLY 5 unique, creative, practical, innovative project ideas.

YOU MUST RETURN ONLY VALID JSON. No markdown, no text before or after the JSON.
Your entire response must be a single JSON object with this exact structure:

{
  "projects": [
    {
      "title": "Project title here",
      "difficulty": "Beginner | Intermediate | Advanced",
      "estimated_time": "e.g. 3 Months",
      "team_size": "e.g. 2-4 Members",
      "description": "A short 2-3 sentence overview of the project.",
      "problem_statement": "The core problem this project solves.",
      "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
      "technologies": ["Technology 1", "Technology 2", "Technology 3"],
      "advantages": ["Advantage 1", "Advantage 2", "Advantage 3"],
      "future_scope": "Details on how this project can be extended in the future.",
      "roadmap": ["Phase 1: ...", "Phase 2: ...", "Phase 3: ..."],
      "presentation_tips": ["Tip 1", "Tip 2", "Tip 3"],
      "project_structure": "project/\n├── frontend/\n├── backend/\n├── models/\n└── docs/"
    }
  ]
}

Do NOT include any explanation, greeting, or text outside the JSON object. Only JSON."""


# ── Helper: call Groq API ─────────────────────────────────────────────────────
def call_groq_api(system_prompt, user_prompt):
    if not GROQ_API_KEY:
        return {"success": False, "error": "Groq API Key is not configured."}
    try:
        client = Groq(api_key=GROQ_API_KEY)
        chat_completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=4096,
        )
        return {"success": True, "content": chat_completion.choices[0].message.content}
    except Exception as e:
        return {"success": False, "error": f"Groq API Error: {str(e)}"}


# ── Helper: extract projects list from raw AI response ────────────────────────
def extract_projects(raw):
    """Try multiple strategies to parse the JSON from the AI response."""
    # Strip markdown code fences if present
    cleaned = re.sub(r'^```(?:json)?\s*', '', raw.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*```$', '', cleaned.strip())

    # Strategy 1: parse cleaned text directly
    try:
        parsed = json.loads(cleaned)
        projects = parsed.get("projects", [])
        if projects:
            print(f"[INFO] Strategy 1 (direct parse) — found {len(projects)} projects")
            return projects
    except Exception:
        pass

    # Strategy 2: regex-extract first {...} block from raw response
    match = re.search(r'\{[\s\S]*\}', raw)
    if match:
        try:
            parsed = json.loads(match.group())
            projects = parsed.get("projects", [])
            if projects:
                print(f"[INFO] Strategy 2 (regex extract) — found {len(projects)} projects")
                return projects
        except Exception as e2:
            print(f"[WARN] Strategy 2 failed: {e2}")

    return []


# ── /generate endpoint ────────────────────────────────────────────────────────
@app.route("/generate", methods=["POST"])
def generate_ideas():
    data = request.get_json()
    if not data or "domain" not in data:
        return jsonify({"success": False, "error": "Missing 'domain' in request body"}), 400

    domain = data["domain"]
    print(f"\n[INFO] Received request — domain: '{domain}'")

    if not GROQ_API_KEY:
        return jsonify({"success": False, "error": "Groq API Key is not configured."}), 500

    try:
        client = Groq(api_key=GROQ_API_KEY)
        chat_completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": f"Generate 5 final year project ideas for the domain: {domain}"}
            ],
            temperature=0.7,
            max_tokens=4096,
        )

        raw = chat_completion.choices[0].message.content
        print(f"[INFO] Groq finish_reason: {chat_completion.choices[0].finish_reason}")
        print(f"[DEBUG] Raw response (first 400 chars):\n{raw[:400]}\n")

        projects = extract_projects(raw)

        if not projects:
            print("[ERROR] No projects extracted from response.")
            return jsonify({
                "success": False,
                "error": "The AI returned an unreadable response. Please try again."
            }), 500

        return jsonify({"success": True, "projects": projects})

    except Exception as e:
        print(f"[ERROR] Groq API Error: {type(e).__name__}: {str(e)}")
        return jsonify({"success": False, "error": f"Groq API Error: {str(e)}"}), 500


# ── Feature Endpoints ─────────────────────────────────────────────────────────

@app.route("/generate_report", methods=["POST"])
def generate_report():
    data = request.get_json()
    title = data.get("title", "Unknown Project")
    description = data.get("description", "")
    sys_prompt = "You are an expert technical writer. Generate a full project report based on the provided title and description."
    user_prompt = f"""Project Title: {title}
Project Description: {description}

Generate a comprehensive project report with these 10 sections:
1. Abstract
2. Introduction
3. Literature Survey
4. Existing System
5. Proposed System
6. System Architecture
7. Modules Description
8. Advantages
9. Future Scope
10. Conclusion

Format clearly with markdown headings."""
    result = call_groq_api(sys_prompt, user_prompt)
    return jsonify(result), 200 if result["success"] else 500


@app.route("/generate_ppt", methods=["POST"])
def generate_ppt():
    data = request.get_json()
    title = data.get("title", "Unknown Project")
    description = data.get("description", "")
    sys_prompt = "You are an expert presenter. Generate detailed slide content for a presentation."
    user_prompt = f"""Project Title: {title}
Project Description: {description}

Generate exactly 10 presentation slides:
Slide 1 - Project Title
Slide 2 - Problem Statement
Slide 3 - Existing System
Slide 4 - Proposed System
Slide 5 - Architecture
Slide 6 - Modules
Slide 7 - Technologies Used
Slide 8 - Advantages
Slide 9 - Future Scope
Slide 10 - Conclusion

Use markdown headings for each slide and bullet points for content."""
    result = call_groq_api(sys_prompt, user_prompt)
    return jsonify(result), 200 if result["success"] else 500


@app.route("/generate_viva", methods=["POST"])
def generate_viva():
    data = request.get_json()
    title = data.get("title", "Unknown Project")
    description = data.get("description", "")
    sys_prompt = "You are a strict but fair academic examiner preparing viva questions."
    user_prompt = f"""Project Title: {title}
Project Description: {description}

Generate exactly:
- 20 Technical Questions about technologies and domain concepts.
- 10 HR Questions about teamwork, challenges, and project management.
- 10 Project Specific Questions about this project's implementation and design decisions.

Format as clearly separated numbered lists with section headings."""
    result = call_groq_api(sys_prompt, user_prompt)
    return jsonify(result), 200 if result["success"] else 500


@app.route("/generate_dataset", methods=["POST"])
def generate_dataset():
    data = request.get_json()
    title = data.get("title", "Unknown Project")
    description = data.get("description", "")
    sys_prompt = "You are an expert data scientist recommending datasets for student projects."
    user_prompt = f"""Project Title: {title}
Project Description: {description}

Recommend the most suitable public dataset(s) for this project.
For each dataset provide:
Dataset Name:
Description:
Dataset Size:
Number of Classes: (or N/A)
Suggested Source: (Kaggle, UCI, HuggingFace, etc.)

List 2-3 options if available."""
    result = call_groq_api(sys_prompt, user_prompt)
    return jsonify(result), 200 if result["success"] else 500


@app.route("/generate_architecture", methods=["POST"])
def generate_architecture():
    data = request.get_json()
    title = data.get("title", "Unknown Project")
    description = data.get("description", "")
    sys_prompt = "You are a software architect. Generate a clear text-based architecture flow."
    user_prompt = f"""Project Title: {title}
Project Description: {description}

Generate a clear vertical architecture flow diagram using arrows (↓) showing data flow from User to the Database or ML model.
Be specific to this project's components. Example format:

User
  ↓
Frontend (React / Vue)
  ↓
REST API (Flask / Node.js)
  ↓
ML Model / Business Logic
  ↓
Database (MySQL / MongoDB)

Provide ONLY the diagram, nothing else."""
    result = call_groq_api(sys_prompt, user_prompt)
    return jsonify(result), 200 if result["success"] else 500


@app.route("/generate_folder_structure", methods=["POST"])
def generate_folder_structure():
    data = request.get_json()
    title = data.get("title", "Unknown Project")
    description = data.get("description", "")
    sys_prompt = "You are a senior developer. Generate a clean project folder structure."
    user_prompt = f"""Project Title: {title}
Project Description: {description}

Generate the recommended source code folder structure using ASCII tree format (├── and └──).
Tailor it to this specific project's tech stack.
Wrap in a markdown code block."""
    result = call_groq_api(sys_prompt, user_prompt)
    return jsonify(result), 200 if result["success"] else 500


@app.route("/generate_estimation", methods=["POST"])
def generate_estimation():
    data = request.get_json()
    title = data.get("title", "Unknown Project")
    description = data.get("description", "")
    sys_prompt = "You are an experienced technical project manager."
    user_prompt = f"""Project Title: {title}
Project Description: {description}

Provide a realistic project estimation:
Difficulty Level: (Beginner / Intermediate / Advanced)
Estimated Development Time: (in weeks or months)
Team Size Recommendation: (number of developers)
Hosting Cost: (estimated monthly cost in USD)
Implementation Complexity: (one sentence summary)

Return ONLY these fields."""
    result = call_groq_api(sys_prompt, user_prompt)
    return jsonify(result), 200 if result["success"] else 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
