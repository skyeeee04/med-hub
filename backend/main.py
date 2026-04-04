from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from route.referral import router
from route.task import router as task_router

app = FastAPI()

app.include_router(router)
app.include_router(task_router) 