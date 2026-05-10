import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json

from agents.orchestrator import process
from core.security import COOKIE_NAME, decode_access_token
from models.user import User
from services.database import init_db, SessionLocal
from services.scheduler import start_scheduler, stop_scheduler
from services.contact_service import seed_default_categories
from services import user_service
from routes.connections import router as connections_router
from routes.banks import router as banks_router
from routes.profile import router as profile_router
from routes.utils import router as utils_router
from routes.tasks import router as tasks_router
from routes.agents import router as agents_router
from routes.google_auth import router as google_auth_router
from routes.google_contacts import router as google_contacts_router
from routes.google_calendar import router as google_calendar_router
from routes.contacts import router as contacts_router
from routes.organizations import router as organizations_router
from routes.auth import router as auth_router
from routes.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    with SessionLocal() as db:
        seed_default_categories(db)
        # Sprint H — admin inicial via env vars + backfill created_by_user_id
        admin = user_service.bootstrap_admin_if_needed(db)
        if admin is not None:
            user_service.backfill_created_by_user_id(db, admin.id)
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

app.include_router(auth_router)       # Sprint H
app.include_router(users_router)      # Sprint H
app.include_router(connections_router)
app.include_router(banks_router)
app.include_router(profile_router)
app.include_router(utils_router)
app.include_router(tasks_router)
app.include_router(agents_router)
app.include_router(google_auth_router)
app.include_router(google_contacts_router)
app.include_router(google_calendar_router)
app.include_router(contacts_router)
app.include_router(organizations_router)


@app.get("/health")
def health():
    return {"status": "ok"}


def _ws_user_from_cookie(websocket: WebSocket) -> User | None:
    """Sprint H — autentica WebSocket via cookie httpOnly access_token."""
    token = websocket.cookies.get(COOKIE_NAME)
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        return None
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.is_active:
            return user
    return None


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    user = _ws_user_from_cookie(websocket)
    if user is None:
        # 1008 = policy violation. Fecha sem aceitar.
        await websocket.close(code=1008)
        return
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
