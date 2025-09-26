from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone

async def update_film_metrics(db: AsyncIOMotorDatabase, film_id: str):
    favorites_count = await db.film_lists.count_documents({"film_id": film_id, "list_type": "favorites"})
    watched_count = await db.film_lists.count_documents({"film_id": film_id, "list_type": "watched"})

    pipeline = [
        {"$match": {"film_id": film_id}},
        {"$group": {"_id": None, "average": {"$avg": "$rating"}, "count": {"$sum": 1}}},
    ]
    agg = await db.ratings.aggregate(pipeline).to_list(1)
    avg = round(agg[0]["average"], 2) if agg else 0.0
    count = agg[0]["count"] if agg else 0

    await db.film_metrics.update_one(
        {"film_id": film_id},
        {"$set": {
            "film_id": film_id,
            "favorites_count": favorites_count,
            "watched_count": watched_count,
            "average_rating": avg,
            "ratings_count": count,
            "updated_at": datetime.now(timezone.utc)
        }},
        upsert=True
    )
