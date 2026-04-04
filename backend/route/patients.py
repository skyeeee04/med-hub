from fastapi import APIRouter


router = APIRouter()

@router.get("/patients")
def get_patients():
    
    # To-do get a explanation based on their language from LLM
    explaination = ""
    
    return explaination