from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.db import get_db
from app.schemas.user import User
from app.services.rate_limit import check_rate_limit

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login_user(email: str, request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    client_ip = request.client.host
    if not check_rate_limit(client_ip, max_requests=5, window_seconds=300):
        raise HTTPException(status_code=429, detail="Muitas tentativas de login")

    user = await db.users.find_one({"email": email.lower()})
    if not user:
        new_user = User(email=email, name=email.split("@")[0])
        await db.users.insert_one(new_user.dict())
        return new_user
    return User(**user)

@router.get("/me")
async def get_current_user(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return User(**user)

@router.get("/test-user")
async def get_test_user(db: AsyncIOMotorDatabase = Depends(get_db)):
    test_email = "cinefilo.teste@filmes.br"
    user = await db.users.find_one({"email": test_email})
    if not user:
        test_user = User(
            email=test_email,
            name="Cinéfilo Brasileiro",
            description=("Apaixonado pelo cinema nacional brasileiro. "
                         "Amo desde os clássicos do Cinema Novo às produções contemporâneas.")
        )
        await db.users.insert_one(test_user.dict())
        return test_user
    return User(**user)
