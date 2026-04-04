from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


@router.get("/tasks")
def get_tasks():
    # To-do get a task from LLM
    tasks = []
    return tasks