from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.db import get_db
from app.schemas.moderation import CommentReportCreate, CommentReport
from app.services.rate_limit import check_rate_limit
from app.services.permissions import check_user_banned
from datetime import datetime, timezone

router = APIRouter(prefix="/moderation", tags=["moderation"])

@router.post("/comments/report")
async def report_comment(report_data: CommentReportCreate, user_id: str, request: Request,
                         db: AsyncIOMotorDatabase = Depends(get_db)):
    client_ip = request.client.host
    if not check_rate_limit(client_ip, max_requests=3, window_seconds=300):
        raise HTTPException(status_code=429, detail="Muitas denúncias")

    if await check_user_banned(db, user_id):
        raise HTTPException(status_code=403, detail="Usuário banido")

    comment = await db.ratings.find_one({"id": report_data.comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comentário não encontrado")

    existing = await db.comment_reports.find_one({
        "comment_id": report_data.comment_id,
        "reporter_user_id": user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Você já denunciou este comentário")

    report = CommentReport(reporter_user_id=user_id, **report_data.dict())
    await db.comment_reports.insert_one(report.dict())
    return {"message": "Denúncia registrada com sucesso"}

@router.get("/reports")
async def get_pending_reports(moderator_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    moderator = await db.users.find_one({"id": moderator_id})
    if not moderator or moderator.get("role") != "moderator":
        raise HTTPException(status_code=403, detail="Acesso negado")

    pipeline = [
        {"$match": {"status": "pending"}},
        {"$lookup": {"from": "ratings", "localField": "comment_id", "foreignField": "id", "as": "comment"}},
        {"$lookup": {"from": "users", "localField": "reporter_user_id", "foreignField": "id", "as": "reporter"}},
        {"$sort": {"created_at": -1}},
    ]
    reports = await db.comment_reports.aggregate(pipeline).to_list(100)

    result = []
    for r in reports:
        comment_info = r.get("comment", [{}])[0] if r.get("comment") else {}
        reporter_info = r.get("reporter", [{}])[0] if r.get("reporter") else {}
        obj = CommentReport(**r)
        result.append({
            **obj.dict(),
            "comment_text": comment_info.get("comment", "Comentário não encontrado"),
            "reporter_name": reporter_info.get("name", "Usuário desconhecido"),
        })
    return result

@router.get("/dashboard")
async def get_moderator_dashboard(moderator_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    moderator = await db.users.find_one({"id": moderator_id})
    if not moderator or moderator.get("role") != "moderator":
        raise HTTPException(status_code=403, detail="Acesso negado")

    pending_reports = await db.comment_reports.count_documents({"status": "pending"})

    thirty_days_ago = datetime.now(timezone.utc) - (timezone.utc.utcoffset(datetime.now()) or datetime.now().utcoffset() or 0)
    # Ajuste simples: considera 30 dias pelo próprio Mongo (mais robusto seria datetime.utcnow() + timedelta)
    from datetime import timedelta
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

    new_profiles = await db.users.count_documents({"created_at": {"$gte": thirty_days_ago}})

    top_rated_pipeline = [
        {"$match": {"ratings_count": {"$gte": 1}}},
        {"$sort": {"average_rating": -1}},
        {"$limit": 5},
        {"$lookup": {"from": "films", "localField": "film_id", "foreignField": "id", "as": "film"}},
    ]
    top = await db.film_metrics.aggregate(top_rated_pipeline).to_list(5)

    return {
        "pending_reports": pending_reports,
        "new_profiles": new_profiles,
        "top_rated_films": [
            {
                "film": t.get("film", [{}])[0] if t.get("film") else {},
                "metrics": {
                    "average_rating": t["average_rating"],
                    "ratings_count": t["ratings_count"],
                }
            }
            for t in top
        ]
    }
