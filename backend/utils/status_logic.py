from typing import List, Dict


VALID_TASK_STATUSES = {"Missing", "Pending", "Complete"}


def normalize_task_status(status: str) -> str:
    if not status:
        return "Pending"

    status = status.strip().title()

    if status not in VALID_TASK_STATUSES:
        return "Pending"

    return status


def compute_referral_status(tasks: List[Dict], scheduled: bool = False) -> str:
    """
    Compute the referral workflow status from task data.
    """

    if scheduled:
        return "Scheduled"

    if not tasks:
        return "Submitted"

    normalized_tasks = []
    for task in tasks:
        normalized_tasks.append(
            {
                "task": task.get("task", ""),
                "responsible": task.get("responsible", "Unknown"),
                "status": normalize_task_status(task.get("status", "Pending")),
            }
        )

    statuses = [task["status"] for task in normalized_tasks]

    if all(status == "Complete" for status in statuses):
        return "Ready"

    if any(status == "Missing" for status in statuses):
        return "Waiting Info"

    return "Reviewing"


def compute_status_progress(status: str) -> int:
    """
    Return progress percentage for UI.
    """
    mapping = {
        "Submitted": 20,
        "Reviewing": 40,
        "Waiting Info": 60,
        "Ready": 80,
        "Scheduled": 100,
    }
    return mapping.get(status, 0)