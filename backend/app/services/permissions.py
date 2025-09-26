from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

async def check_user_banned(db: AsyncIOMotorDatabase, user_id: str) -> bool:
    now = datetime.now(timezone.utc)
    ban = await db.user_bans.find_one({
        "user_id": user_id,
        "$or": [{"expires_at": None}, {"expires_at": {"$gt": now}}]
    })
    return ban is not None

async def can_view_user_profile(db: AsyncIOMotorDatabase, viewer_id: str, profile_user_id: str) -> bool:
    if viewer_id == profile_user_id:
        return True
    profile = await db.users.find_one({"id": profile_user_id})
    if not profile or not profile.get("is_private", False):
        return True
    viewer = await db.users.find_one({"id": viewer_id})
    return bool(viewer and profile_user_id in viewer.get("friends", []))
