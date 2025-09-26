from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, timezone
import uuid

class CommentReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    comment_id: str
    reporter_user_id: str
    reason: str = Field(..., pattern="^(spam|inappropriate|harassment|off_topic|other)$")
    description: Optional[str] = Field(None, max_length=500)
    status: str = Field(default="pending", pattern="^(pending|reviewed|dismissed)$")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommentReportCreate(BaseModel):
    comment_id: str
    reason: str
    description: Optional[str] = None

    @validator("reason")
    def validate_reason(cls, v):
        allowed = ['spam', 'inappropriate', 'harassment', 'off_topic', 'other']
        if v not in allowed:
            raise ValueError("Razão inválida")
        return v

class ModeratorAction(BaseModel):
    action_type: str
    password: str = Field(..., min_length=4, max_length=4)

    @validator("password")
    def validate_password(cls, v):
        if v != "1357":
            raise ValueError("Senha incorreta")
        return v
