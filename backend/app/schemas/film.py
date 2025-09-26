from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timezone
import uuid

class Film(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=1, max_length=200)
    banner_url: Optional[str] = None
    description: str = Field(..., min_length=10, max_length=2000)
    tags: List[str] = Field(default_factory=list)
    year: Optional[int] = Field(None, ge=1890, le=2030)
    director: Optional[str] = Field(None, max_length=200)
    actors: List[str] = Field(default_factory=list)
    imdb_rating: Optional[float] = Field(None, ge=0, le=10)
    letterboxd_rating: Optional[float] = Field(None, ge=0, le=5)
    watch_links: List[Dict[str, str]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FilmCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    banner_url: Optional[str] = None
    description: str = Field(..., min_length=10, max_length=2000)
    tags: List[str] = Field(default_factory=list)
    year: Optional[int] = Field(None, ge=1890, le=2030)
    director: Optional[str] = Field(None, max_length=200)
    actors: List[str] = Field(default_factory=list)
    imdb_rating: Optional[float] = Field(None, ge=0, le=10)
    letterboxd_rating: Optional[float] = Field(None, ge=0, le=5)
    watch_links: List[Dict[str, str]] = Field(default_factory=list)
