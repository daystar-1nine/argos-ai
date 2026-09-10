"""
ARGOS AI - Profile & Subscription Pydantic Schemas
"""

from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    organization: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = Field(None, max_length=500)


class PasswordChangeRequest(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)


class NotificationPreferenceUpdate(BaseModel):
    email_alerts: Optional[bool] = None
    push_alerts: Optional[bool] = None
    detection_alerts: Optional[bool] = None
    incident_alerts: Optional[bool] = None


class NotificationPreferenceResponse(BaseModel):
    email_alerts: bool
    push_alerts: bool
    detection_alerts: bool
    incident_alerts: bool

    class Config:
        from_attributes = True


class SubscriptionInfo(BaseModel):
    plan: str
    name: str
    status: str
    price_inr: int
    billing_period: Optional[str] = None
    started_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    provider: Optional[str] = None


class UsageInfo(BaseModel):
    analyses: int
    analysis_limit: int
    analyses_remaining: int
    protected_assets: int
    monitoring_sources: int
    incidents: int


class UserSummary(BaseModel):
    id: str
    name: str
    email: str
    organization: Optional[str] = None
    role: str
    created_at: Optional[datetime] = None
    avatar_url: Optional[str] = None


class UserProfileResponse(BaseModel):
    user: UserSummary
    subscription: SubscriptionInfo
    usage: UsageInfo
    features: Dict[str, bool]


class SubscriptionCheckoutRequest(BaseModel):
    plan_id: str = Field(default="pro")
