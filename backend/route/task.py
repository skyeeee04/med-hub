from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter()

AGENT_BASE_URL = "http://127.0.0.1:8001"


class TaskRequest(BaseModel):
    patient_name: str
    referred_specialty: str
    reason_for_referral: str
    current_documents: str
    insurance_info: str
    language_preference: str


@router.post("/tasks")
async def get_tasks(task_request: TaskRequest):
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{AGENT_BASE_URL}/tasks",
                json=task_request.model_dump(),
            )
            response.raise_for_status()
            return response.json()

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Agent returned error: {e.response.text}",
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Could not connect to agent service: {str(e)}",
            )