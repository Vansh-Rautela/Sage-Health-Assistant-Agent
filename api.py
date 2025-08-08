import uvicorn
import sys
import os
import json
import re
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Dict
from dotenv import load_dotenv

# Add the project root to the Python path to resolve src imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

# Explicitly load the .env file from the project's root directory
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)

from src.auth.auth_service import AuthService
from src.agents.analysis_agent import AnalysisAgent
from src.utils.pdf_extractor import extract_text_from_pdf
from src.config.prompts import SPECIALIST_PROMPTS

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Sage API",
    description="API for analyzing medical reports and managing user sessions.",
    version="1.0.0",
)

# --- THIS IS THE FIX: Hardcoded CORS Configuration ---
# We have removed the environment variable and directly added your Vercel URL.
origins = [
    "http://localhost:3000",  # For local development
    "https://sage-health-assistant-agent-4epiv6kn3-vansh-rautelas-projects.vercel.app" # Your deployed frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- END OF FIX ---

# --- Service Instances ---
auth_service = AuthService()
analysis_agent = AnalysisAgent()

# --- Pydantic Models ---
class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class FollowUpRequest(BaseModel):
    prompt: str
    session_id: str
    report_context: dict

class RiskScoreRequest(BaseModel):
    report_context: dict

# --- API Endpoints ---
@app.post("/signup")
async def signup(payload: SignUpRequest):
    success, result = auth_service.sign_up(payload.email, payload.password, payload.name)
    if not success:
        raise HTTPException(status_code=400, detail=result)
    return {"user": result}

@app.post("/login")
async def login(payload: LoginRequest):
    success, result = auth_service.sign_in(payload.email, payload.password)
    if not success:
        raise HTTPException(status_code=401, detail=result)
    return {"user": result, "token": result.get("token")}

@app.get("/sessions/{user_id}")
async def get_sessions(user_id: str):
    success, sessions = auth_service.get_user_sessions(user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to retrieve sessions.")
    return sessions

@app.post("/sessions")
async def create_session(body: Dict[str, str]):
    user_id = body.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required.")
    success, session = auth_service.create_session(user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create session.")
    return session

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    success, error = auth_service.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=500, detail=error)
    return {"message": "Session deleted successfully."}

@app.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str):
    success, messages = auth_service.get_session_messages(session_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to retrieve messages.")
    return messages

@app.post("/analyze/initial", summary="Perform initial analysis of a report")
async def analyze_initial(
    patient_name: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    session_id: str = Form(...),
    file: UploadFile = File(...)
):
    pdf_contents = extract_text_from_pdf(file.file)
    if "error" in pdf_contents.lower():
        raise HTTPException(status_code=400, detail=pdf_contents)
        
    report_data = { "patient_name": patient_name, "age": age, "gender": gender, "report": pdf_contents }
    
    user_message = f"Analyzing report for patient: {patient_name}, Age: {age}, Gender: {gender}."
    auth_service.save_chat_message(session_id, user_message, "user")

    result = analysis_agent.analyze_report(
        data=report_data, system_prompt=SPECIALIST_PROMPTS["comprehensive_analyst"]
    )
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
        
    auth_service.save_chat_message(session_id, result["content"], "assistant")
    return {"analysis": result, "report_context": report_data}

@app.post("/analyze/followup")
async def analyze_followup(payload: FollowUpRequest):
    auth_service.save_chat_message(payload.session_id, payload.prompt, "user")
    success, messages = auth_service.get_session_messages(payload.session_id)
    chat_history = messages if success else []
    
    follow_up_data = { 
        **payload.report_context, 
        "question": payload.prompt 
    }
    
    result = analysis_agent.analyze_report(
        data=follow_up_data,
        system_prompt=SPECIALIST_PROMPTS["comprehensive_analyst"],
        chat_history=chat_history
    )
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
        
    auth_service.save_chat_message(payload.session_id, result["content"], "assistant")
    return {"response": result}

@app.post("/analyze/risk-score", summary="Generate personalized health risk scores")
async def analyze_risk_score(payload: RiskScoreRequest):
    try:
        result = analysis_agent.analyze_report(
            data=payload.report_context,
            system_prompt=SPECIALIST_PROMPTS["risk_scorer"]
        )
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "AI model failed to generate risk scores."))

        content = result["content"]
        
        try:
            risk_scores = json.loads(content)
            return risk_scores
        except json.JSONDecodeError:
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                try:
                    risk_scores = json.loads(json_str)
                    return risk_scores
                except json.JSONDecodeError:
                    raise HTTPException(status_code=500, detail="AI returned a malformed JSON object.")
            else:
                raise HTTPException(status_code=500, detail="AI did not return a valid JSON object.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)