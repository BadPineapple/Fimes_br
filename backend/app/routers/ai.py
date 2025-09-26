from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.db import get_db
from app.schemas.ai import AIRecommendationRequest, AIRecommendationResponse
from app.services.ai_recommender import recommend_from_description

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/recommend", response_model=AIRecommendationResponse)
async def get_ai_recommendations(request_data: AIRecommendationRequest,
                                 db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        films = await db.films.find().to_list(100)
        titles = [f["title"] for f in films]
        recs, expl = await recommend_from_description(titles, request_data.description)
        return AIRecommendationResponse(recommendations=recs[:5], explanation=expl)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na recomendação: {str(e)}")
