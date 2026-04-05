from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx

router = APIRouter()

AGENT_BASE_URL = "http://127.0.0.1:8001"


class MedicationItem(BaseModel):
    name: str
    explanation: str
    dosage: Optional[str] = ""
    frequency: Optional[str] = ""
    duration: Optional[str] = ""
    reminder: Optional[str] = ""


class AppointmentNotesRequest(BaseModel):
    patient_name: str
    age: Optional[int] = None
    language_preference: str = "en"
    notes: List[str]


class AppointmentNotesResponse(BaseModel):
    translated_summary: str
    medications: List[MedicationItem]


@router.post("/appointments/notes", response_model=AppointmentNotesResponse)
async def get_bullet_points(appointment_notes: AppointmentNotesRequest):
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{AGENT_BASE_URL}/appointments/summarize",
                json={
                    "patient_name": appointment_notes.patient_name,
                    "age": appointment_notes.age,
                    "language_preference": appointment_notes.language_preference,
                    "notes": appointment_notes.notes,
                },
            )
            response.raise_for_status()
            result = response.json()

            return AppointmentNotesResponse(
                translated_summary=result.get("translated_summary", ""),
                medications=result.get("medications", []),
            )

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Agent returned error: {e.response.text}",
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Could not connect to agent: {str(e)}",
            )