from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.db import get_db
from app.schemas.rating import UserRatingCreate, UserRating
from app.services.rate_limit import check_rate_limit
from app.services.permissions import check_user_banned
from app.services.metrics import update_film_metrics

router = APIRouter(prefix="/films/{film_id}/ratings", tags=["ratings"])

@router.post("")
async def create_rating(film_id: str, rating_data: UserRatingCreate, user_id: str,
                        request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    client_ip = request.client.host
    if not check_rate_limit(client_ip, max_requests=5, window_seconds=300):
        raise HTTPException(status_code=429, detail="Muitas tentativas")

    if await check_user_banned(db, user_id):
        raise HTTPException(status_code=403, detail="Usuário banido do sistema")

    film = await db.films.find_one({"id": film_id})
    if not film:
        raise HTTPException(status_code=404, detail="Filme não encontrado")

    rating = UserRating(user_id=user_id, **rating_data.dict())
    await db.ratings.delete_one({"user_id": user_id, "film_id": film_id})
    await db.ratings.insert_one(rating.dict())

    await update_film_metrics(db, film_id)
    return rating.dict()

@router.get("")
async def get_film_ratings(film_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    pipeline = [
        {"$match": {"film_id": film_id}},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "id",
            "as": "user"
        }},
        {"$sort": {"created_at": -1}},
    ]
    ratings = await db.ratings.aggregate(pipeline).to_list(1000)
    result = []
    for r in ratings:
        user_info = r.get("user", [{}])[0] if r.get("user") else {}
        obj = UserRating(**r)
        result.append({
            **obj.dict(),
            "user_name": user_info.get("name", "Usuário"),
            "user_avatar": user_info.get("avatar_url"),
        })
    return result

@router.get("/average")
async def get_film_average_rating(film_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    pipeline = [
        {"$match": {"film_id": film_id}},
        {"$group": {"_id": None, "average": {"$avg": "$rating"}, "count": {"$sum": 1}}},
    ]
    res = await db.ratings.aggregate(pipeline).to_list(1)
    if res:
        return {"average": round(res[0]["average"], 1), "count": res[0]["count"]}
    return {"average": 0, "count": 0}
