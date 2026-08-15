import os
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("botanic_ai")

from models import HealthResponse
from api.search import router as search_router
from api.filters import router as filters_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    openai_configured = bool(os.getenv("OPENAI_API_KEY", "").strip())
    ncbi_configured = bool(os.getenv("NCBI_API_KEY", "").strip())
    logger.info("🌿 BotanicAI Pharmacology Search Engine API Initializing...")
    logger.info(f"✨ OpenAI LLM Extraction: {'ENABLED (GPT-4o-mini)' if openai_configured else 'NLP Heuristic Engine (No API key set)'}")
    logger.info(f"📚 PubMed NCBI Rate Limit: {'Key configured' if ncbi_configured else 'Standard unauthenticated tier'}")
    yield
    logger.info("🌿 BotanicAI API Shutdown complete.")


app = FastAPI(
    title="BotanicAI Pharmacology API",
    description="Scientific literature mining and LLM-powered phytochemistry extraction API",
    version="1.3.0",
    lifespan=lifespan
)

# CORS configuration
origins_env = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,https://usebotanicai.netlify.app"
)
allowed_origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ALLOW_ALL_ORIGINS") == "true" else allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(search_router)
app.include_router(filters_router)


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint to verify backend status and LLM configuration."""
    return HealthResponse(
        status="ok",
        version="1.3.0",
        llm_configured=bool(os.getenv("OPENAI_API_KEY", "").strip()),
        service="BotanicAI Backend"
    )


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "BotanicAI Botanical Pharmacology Search Engine API",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
