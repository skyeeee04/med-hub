from fastapi import APIRouter
from agent import analyze_referral_logic, ReferralAnalysisResponse, ReferralRequest

    
router = APIRouter()


@router.post("/referral")
async def analyze_referral(referral_request: ReferralRequest) -> ReferralAnalysisResponse:
    
    # To do: ctx
    analysis = await analyze_referral_logic(None, referral_request) 
    
    return analysis
    