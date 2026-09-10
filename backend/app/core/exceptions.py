"""
ARGOS AI - Centralized Exception Handling
Defines custom domain exceptions and FastAPI HTTP handlers with structured error formatting.
"""

from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.logging import logger


class ArgosException(Exception):
    """Base application exception for ARGOS AI."""
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class EntityNotFoundException(ArgosException):
    def __init__(self, entity_name: str, entity_id: str):
        super().__init__(
            message=f"{entity_name} with ID '{entity_id}' not found.",
            code="NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"entity": entity_name, "id": entity_id}
        )


class MediaValidationException(ArgosException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="MEDIA_VALIDATION_ERROR",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )


class AuthenticationException(ArgosException):
    def __init__(self, message: str = "Invalid authentication credentials"):
        super().__init__(
            message=message,
            code="UNAUTHENTICATED",
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class AuthorizationException(ArgosException):
    def __init__(self, message: str = "You do not have permission to access this resource"):
        super().__init__(
            message=message,
            code="FORBIDDEN",
            status_code=status.HTTP_403_FORBIDDEN
        )


class ModelUnavailableException(ArgosException):
    def __init__(self, model_name: str, reason: str):
        super().__init__(
            message=f"Forensic model '{model_name}' unavailable: {reason}",
            code="MODEL_UNAVAILABLE",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details={"model": model_name, "reason": reason}
        )


def format_error_response(code: str, message: str, details: Dict[str, Any] = None) -> Dict[str, Any]:
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details or {}
        }
    }


async def argos_exception_handler(request: Request, exc: ArgosException) -> JSONResponse:
    logger.error(f"[EXCEPTION] {exc.code}: {exc.message} details={exc.details}")
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(exc.code, exc.message, exc.details)
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    code = "HTTP_ERROR"
    if exc.status_code == 404:
        code = "NOT_FOUND"
    elif exc.status_code == 400:
        code = "BAD_REQUEST"
    elif exc.status_code == 401:
        code = "UNAUTHORIZED"
    elif exc.status_code == 403:
        code = "FORBIDDEN"

    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(code, str(exc.detail))
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.warning(f"[VALIDATION_ERROR] {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=format_error_response(
            "VALIDATION_ERROR",
            "Request validation failed.",
            {"fields": exc.errors()}
        )
    )
