from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.route.referral import router as referral_router
from backend.route.task import router as task_router
from backend.route.patients import router as patients_router
from backend.route.status import router as status_router

app = FastAPI(
    title="Med Hub API",
    description="Backend API for referral analysis, patient explanations, tasks, and status tracking",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(referral_router, tags=["Referral"])
app.include_router(patients_router, tags=["Patients"])
app.include_router(task_router, tags=["Tasks"])
app.include_router(status_router, tags=["Status"])


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Med Hub backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }