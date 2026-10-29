import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.ai import router as ai_router
from app.api.events import router as events_router
from app.api.tasks import router as tasks_router
from app.api.ideas import router as ideas_router
from app.api.export import router as export_router
from app.api.vendors import router as vendors_router
from app.api.guests import router as guests_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lumiere-backend")

app = FastAPI(
    title="Lumière API",
    description="Python Backend for Lumière GenAI Event Planner",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(ai_router)
app.include_router(events_router)
app.include_router(tasks_router)
app.include_router(ideas_router)
app.include_router(export_router)
app.include_router(vendors_router)
app.include_router(guests_router)

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Lumière Python Backend",
        "llm_provider": settings.LLM_PROVIDER,
        "database": "configured"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=False)
