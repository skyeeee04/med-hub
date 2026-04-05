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


class TaskItem(BaseModel):
    task: str
    responsible: str
    status: str


class ReferralStatusRequest(BaseModel):
    patient_name: str
    tasks: list[TaskItem]
    scheduled: bool = False


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
            raise HTTPException(
                status_code=500,
                detail=f"Agent request failed: {str(e)}"
            )


@router.post("/referral/status")
async def get_referral_status(status_request: ReferralStatusRequest):
    """
    Safe add-on endpoint:
    - does NOT change your existing /referral behavior
    - computes workflow status from tasks
    """
    try:
        if status_request.scheduled:
            status = "Scheduled"
            progress_percent = 100
        elif not status_request.tasks:
            status = "Submitted"
            progress_percent = 20
        else:
            task_statuses = [task.status.strip().title() for task in status_request.tasks]

            if all(s == "Complete" for s in task_statuses):
                status = "Ready"
                progress_percent = 80
            elif any(s == "Missing" for s in task_statuses):
                status = "Waiting Info"
                progress_percent = 60
            else:
                status = "Reviewing"
                progress_percent = 40

        workflow_steps = [
            "Submitted",
            "Reviewing",
            "Waiting Info",
            "Ready",
            "Scheduled",
        ]

        current_step_index = workflow_steps.index(status)

        return {
            "patient_name": status_request.patient_name,
            "status": status,
            "progress_percent": progress_percent,
            "workflow_steps": workflow_steps,
            "current_step_index": current_step_index,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Status computation failed: {str(e)}"
        )