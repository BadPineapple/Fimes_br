from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.db import get_db
from app.schemas.film import Film, FilmCreate
from typing import List

router = APIRouter(prefix="/films", tags=["films"])

@router.get("", response_model=List[Film])
async def get_films(db: AsyncIOMotorDatabase = Depends(get_db)):
    films = await db.films.find().to_list(1000)
    return [Film(**f) for f in films]

@router.get("/featured", response_model=List[Film])
async def get_featured_films(db: AsyncIOMotorDatabase = Depends(get_db)):
    films = await db.films.find().limit(12).to_list(12)
    return [Film(**f) for f in films]

@router.get("/genres")
async def get_available_genres(db: AsyncIOMotorDatabase = Depends(get_db)):
    pipeline = [
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    genres = await db.films.aggregate(pipeline).to_list(100)
    return [{"genre": g["_id"], "count": g["count"]} for g in genres]

@router.get("/by-genre/{genre}")
async def get_films_by_genre(genre: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    films = await db.films.find({"tags": {"$regex": genre, "$options": "i"}}).to_list(1000)
    return [Film(**f) for f in films]

@router.get("/{film_id}", response_model=Film)
async def get_film(film_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    film = await db.films.find_one({"id": film_id})
    if not film:
        raise HTTPException(status_code=404, detail="Filme não encontrado")
    return Film(**film)

@router.post("", response_model=Film)
async def create_film(film_data: FilmCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    film = Film(**film_data.dict())
    await db.films.insert_one(film.dict())
    # métricas iniciais:
    await db.film_metrics.update_one({"film_id": film.id}, {"$setOnInsert": {
        "film_id": film.id, "favorites_count": 0, "watched_count": 0,
        "average_rating": 0.0, "ratings_count": 0
    }}, upsert=True)
    return film
