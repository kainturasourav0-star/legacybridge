import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import init_db
from backend.services.scheduler import start_scheduler, stop_scheduler
from backend.api.router import api_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "service": "legacybridge", "message": "%(message)s"}'
)
logger = logging.getLogger("legacybridge.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing LegacyBridge Backend Engine...")
    await init_db()
    start_scheduler()
    logger.info(f"Demo Mode: {settings.DEMO_MODE} | TinyFish Endpoint: {settings.TINYFISH_BASE_URL}")
    yield
    stop_scheduler()
    logger.info("LegacyBridge Backend Engine shutdown cleanly.")

app = FastAPI(
    title="LegacyBridge API",
    description="Natural language web agent bridge for legacy portals and enterprise ERPs.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "demo_mode": settings.DEMO_MODE,
        "tinyfish_status": "ready",
        "system": "LegacyBridge v1.0"
    }

@app.get("/")
async def root():
    return {
        "app": "LegacyBridge",
        "tagline": "Describe the task. Keep the old system.",
        "documentation": "/docs",
        "feed_api_example": "/api/v1/feeds/task-q3-sales/latest"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
