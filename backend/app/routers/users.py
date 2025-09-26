from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.db import get_db
from app.schemas.user import UserUpdate, User

router = APIRouter(prefix="/users", tags=["users"])

@router.put("/{user_id}")
async def update_user(user_id: str, updates: UserUpdate, db: AsyncIOMotorDatabase = Depends(get_db)):
    update_dict = {k: v for k, v in updates.dict().items() if v is not None}
    update_dict.pop("is_supporter", None)  # Somente moderadores poderiam alterar; removendo.

    await db.users.update_one({"id": user_id}, {"$set": update_dict})
    updated = await db.users.find_one({"id": user_id})
    if not updated:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return User(**updated)

@router.post("/{user_id}/friends/{friend_id}")
async def add_friend(user_id: str, friend_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    await db.users.update_one({"id": user_id}, {"$addToSet": {"friends": friend_id}})
    await db.users.update_one({"id": friend_id}, {"$addToSet": {"friends": user_id}})
    return {"message": "Amigo adicionado com sucesso"}
