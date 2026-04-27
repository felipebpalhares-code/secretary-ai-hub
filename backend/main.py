import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json

from agents.orchestrator import process
from services.database import init_db
from services.scheduler import start_scheduler, stop_scheduler
from routes.connections import router as connections_router
from routes.banks import router as banks_router
from routes.profile import router as profile_router
from routes.utils import router as utils_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="Felipe Hub", lifespan=lifespan)

# CORS — em produção, restringir CORS_ORIGINS via env var
DEFAULT_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"
allowed = os.getenv("CORS_ORIGINS", DEFAULT_ORIGINS).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(connections_router)
app.include_router(banks_router)
app.include_router(profile_router)
app.include_router(utils_router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            user_message = data.get("content", "")
            async for update in process(user_message):
                await websocket.send_text(json.dumps(update))
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(json.dumps({"type": "error", "content": f"Erro: {e}"}))
