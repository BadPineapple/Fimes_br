import logging
from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.cors import CORSMiddleware

from app.core.settings import settings
from app.core.db import init_mongo, close_mongo

from app.routers import auth as auth_router
from app.routers import users as users_router
from app.routers import films as films_router
from app.routers import ratings as ratings_router
from app.routers import film_lists as film_lists_router
from app.routers import moderation as moderation_router
from app.routers import ai as ai_router

from app.services.init_data import initialize_moderator, initialize_sample_films
from app.core.db import get_db

app = FastAPI(
    title=settings.TITLE,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url=settings.DOCS_URL,
    redoc_url=settings.REDOC_URL,
)

# Middlewares de segurança
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.TRUSTED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,
)

# Routers (prefixo /api conforme original)
app.include_router(auth_router.router, prefix="/api")
app.include_router(users_router.router, prefix="/api")
app.include_router(films_router.router, prefix="/api")
app.include_router(ratings_router.router, prefix="/api")
app.include_router(film_lists_router.router, prefix="/api")
app.include_router(moderation_router.router, prefix="/api")
app.include_router(ai_router.router, prefix="/api")

# Logging básico
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def on_startup():
    init_mongo(app)
    # inicialização de dados
    db = get_db  # dependency factory
    # Pega a instância do DB através de um request fake não é ideal; então:
    from starlette.requests import Request
    class _R:  # pequeno truque: objeto com app para get_db
        def __init__(self, app): self.app = app
    _db = db(_R(app))
    await initialize_moderator(_db)
    await initialize_sample_films(_db)
    logger.info("Filmes.br API inicializada com sucesso")

@app.on_event("shutdown")
async def on_shutdown():
    await close_mongo(app)
    logger.info("Conexão com MongoDB fechada")
