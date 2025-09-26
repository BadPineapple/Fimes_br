from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import re

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None
    role: str = Field(default="user", pattern="^(user|moderator)$")
    friends: List[str] = Field(default_factory=list)
    is_private: bool = Field(default=False)
    is_supporter: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @validator("email")
    def validate_email(cls, v):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError("Email inválido")
        return v.lower()

class UserCreate(BaseModel):
    email: str
    name: str
    description: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None
    is_private: Optional[bool] = None
