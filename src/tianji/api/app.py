"""FastAPI application factory for Tianji."""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from tianji.config import get_config


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    config = get_config()

    app = FastAPI(
        title="Thiên Cơ API",
        description="API Kinh Dịch và huyền học Trung Hoa: Bát Tự, Lục Hào, Tử Vi Đẩu Số.",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    origins = [
        origin.strip()
        for origin in os.getenv(
            "TIANJI_CORS_ORIGINS",
            "http://127.0.0.1:8000,http://localhost:8000,http://127.0.0.1:8081,http://localhost:8081",
        ).split(",")
        if origin.strip()
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    from tianji.api.routes import router
    app.include_router(router)

    @app.get("/health")
    async def health():
        return {"status": "ok", "service": "tianji", "version": "0.1.0"}

    return app
