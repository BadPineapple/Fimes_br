from pydantic import BaseModel, Field
from typing import List

class AIRecommendationRequest(BaseModel):
    description: str = Field(..., min_length=5, max_length=500)

class AIRecommendationResponse(BaseModel):
    recommendations: List[str]
    explanation: str
