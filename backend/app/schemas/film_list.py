from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, timezone
import uuid

class FilmList(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    film_id: str
    list_type: str = Field(..., pattern="^(watched|to_watch|favorites)$")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FilmListCreate(BaseModel):
    film_id: str
    list_type: str

    @validator("list_type")
    def validate_list_type(cls, v):
        allowed = ["watched", "to_watch", "favorites"]
        if v not in allowed:
            raise ValueError("Tipo de lista inválido")
        return v
