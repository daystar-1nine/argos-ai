"""
ARGOS AI - Authentication & User Schemas
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    confirm_password: Optional[str] = None
    terms_accepted: Optional[bool] = True
    organization: Optional[str] = "Independent Creator"
    role: Optional[str] = "creator"

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v


# Alias for backward compatibility
UserCreate = SignupRequest


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Alias for backward compatibility
UserLogin = LoginRequest


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=72)
    confirm_password: Optional[str] = None

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v


class UserSummaryResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    plan: str = "free"
    role: str = "creator"
    organization: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    organization: Optional[str] = None
    role: str = "creator"
    avatar_url: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    session_id: Optional[str] = None
    user: UserResponse


class AuthMeResponse(BaseModel):
    user: UserSummaryResponse
    authenticated: bool = True
    # Backwards compatibility fields for direct access
    id: str
    email: EmailStr
    name: str
    plan: str = "free"


class SessionResponse(BaseModel):
    id: str
    device: str
    ip_hash: Optional[str] = None
    created_at: datetime
    last_used_at: datetime
    is_current: bool = False

