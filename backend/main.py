import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.ai import router as ai_router
from app.api.events import router as events_router
from app.api.tasks import router as tasks_router
from app.api.ideas import router as ideas_router
from app.api.export import router as export_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("soiree-backend")

app = FastAPI(
    title="Soirée API",
    description="Python Backend for Soirée GenAI Event Planner",
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

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Soirée Python Backend",
        "llm_provider": settings.LLM_PROVIDER,
        "database": "configured"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
