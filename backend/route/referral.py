from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter()

AGENT_BASE_URL = "http://127.0.0.1:8001"


class ReferralRequest(BaseModel):
    patient_name: str
    age: int | None = None
    language_preference: str = "en"
    location: str | None = None
    insurance: str | None = None
    referral_text: str


@router.post("/referral")
async def analyze_referral(referral_request: ReferralRequest):
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{AGENT_BASE_URL}/analyze_referral",
                json=referral_request.model_dump(),
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Agent request failed: {str(e)}")