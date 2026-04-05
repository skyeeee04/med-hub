from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from route.referral import router as referral_router
from route.patients import router as patients_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(referral_router)
app.include_router(patients_router)


@app.get("/")
def root():
    return {"status": "ok"}