from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter()

AGENT_BASE_URL = "http://127.0.0.1:8001"


class PatientExplanationRequest(BaseModel):
    patient_name: str
    language_preference: str = "en"
    summary_text: str


@router.get("/patients")
async def get_patients():
    return {
        "message": "Use POST /patients/explain with patient_name, language_preference, and summary_text."
    }


@router.post("/patients/explain")
async def explain_patient(patient_request: PatientExplanationRequest):
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{AGENT_BASE_URL}/patients/explain",
                json=patient_request.model_dump(),
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Agent request failed: {str(e)}")