from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from backend.utils.status_logic import compute_referral_status, compute_status_progress


router = APIRouter()


class TaskItem(BaseModel):
    task: str
    responsible: str
    status: str


class StatusRequest(BaseModel):
    patient_name: str
    tasks: List[TaskItem]
    scheduled: bool = False


class StatusResponse(BaseModel):
    patient_name: str
    status: str
    progress_percent: int
    workflow_steps: List[str]
    current_step_index: int


WORKFLOW_STEPS = [
    "Submitted",
    "Reviewing",
    "Waiting Info",
    "Ready",
    "Scheduled",
]


@router.post("/status", response_model=StatusResponse)
def get_referral_status(status_request: StatusRequest):
    tasks_as_dicts = [task.dict() for task in status_request.tasks]

    status = compute_referral_status(
        tasks=tasks_as_dicts,
        scheduled=status_request.scheduled,
    )

    current_step_index = WORKFLOW_STEPS.index(status)

    return StatusResponse(
        patient_name=status_request.patient_name,
        status=status,
        progress_percent=compute_status_progress(status),
        workflow_steps=WORKFLOW_STEPS,
        current_step_index=current_step_index,
    )