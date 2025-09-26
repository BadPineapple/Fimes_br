from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from fastapi import Request
from .settings import settings

MONGO_CLIENT_KEY = "mongo_client"
MONGO_DB_KEY = "mongo_db"

def init_mongo(app) -> None:
    client = AsyncIOMotorClient(settings.MONGO_URL)
    app.state.__setattr__(MONGO_CLIENT_KEY, client)
    app.state.__setattr__(MONGO_DB_KEY, client[settings.DB_NAME])

async def close_mongo(app) -> None:
    client: AsyncIOMotorClient = getattr(app.state, MONGO_CLIENT_KEY, None)
    if client:
        client.close()

def get_db(request: Request) -> AsyncIOMotorDatabase:
    return getattr(request.app.state, MONGO_DB_KEY)
