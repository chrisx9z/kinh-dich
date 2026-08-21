"""API routes for Tianji."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from tianji.bazi.chart import create_chart
from tianji.bazi.five_elements import elements_from_chart
from tianji.bazi.ten_gods import ten_gods_from_chart
from tianji.liuyao.analysis import LiuYaoAnalysis
from tianji.liuyao.casting import cast_by_numbers, cast_by_time

router = APIRouter(prefix="/api/v1", tags=["tianji"])


# --- Request/Response Models ---

class BaZiRequest(BaseModel):
    year: int = Field(..., ge=1900, le=2100, description="Năm sinh")
    month: int = Field(..., ge=1, le=12, description="Tháng sinh")
    day: int = Field(..., ge=1, le=31, description="Ngày sinh")
    hour: int = Field(..., ge=0, le=23, description="Giờ sinh (định dạng 24 giờ)")
    gender: str = Field("nam", description="Giới tính: nam/nữ")


class LiuYaoRequest(BaseModel):
    numbers: Optional[list[int]] = Field(None, description="Ít nhất 2 số để khởi quẻ (tùy chọn)")
    question: str = Field("Tổng quan vận trình", description="Nội dung cần hỏi")


class ZiWeiRequest(BaseModel):
    year: int = Field(..., ge=1900, le=2100)
    lunar_month: int = Field(..., ge=1, le=12, description="Tháng âm lịch")
    lunar_day: int = Field(..., ge=1, le=30, description="Ngày âm lịch")
    hour: int = Field(..., ge=0, le=23)
    gender: str = Field("nam")


# --- Routes ---

@router.post("/bazi/chart", summary="Lập lá số Bát Tự")
async def bazi_chart(req: BaZiRequest):
    """Lập lá số Bát Tự."""
    try:
        chart = create_chart(req.year, req.month, req.day, req.hour, req.gender)
        gods = {
            position: {
                "stem": result.stem.char,
                "ten_god": result.ten_god,
                "english": result.english,
                "meaning": result.meaning,
            }
            for position, result in ten_gods_from_chart(chart).items()
        }
        elements = elements_from_chart(chart)
        return {
            "status": "ok",
            "birth": {
                "year": req.year,
                "month": req.month,
                "day": req.day,
                "hour": req.hour,
                "gender": req.gender,
            },
            "pillars": {
                "year": str(chart.year_pillar),
                "month": str(chart.month_pillar),
                "day": str(chart.day_pillar),
                "hour": str(chart.hour_pillar),
            },
            "day_master": str(chart.day_pillar.stem),
            "ten_gods": gods,
            "five_elements": {
                element.value: score for element, score in elements.weighted_scores.items()
            },
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/liuyao/cast", summary="Gieo quẻ Lục Hào")
async def liuyao_cast(req: LiuYaoRequest):
    """Gieo quẻ Lục Hào."""
    try:
        if req.numbers:
            if len(req.numbers) < 2:
                raise ValueError("Cần ít nhất 2 số")
            result = cast_by_numbers(*req.numbers[:3])
        else:
            result = cast_by_time(datetime.now())

        analysis_result = LiuYaoAnalysis(result).to_dict()
        return {
            "status": "ok",
            "question": req.question,
            **analysis_result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ziwei/chart", summary="Lập lá số Tử Vi Đẩu Số")
async def ziwei_chart(req: ZiWeiRequest):
    """Lập lá số Tử Vi Đẩu Số."""
    try:
        from tianji.ziwei.chart import create_ziwei_chart
        chart = create_ziwei_chart(
            req.year, req.lunar_month, req.lunar_day, req.hour, req.gender
        )
        palaces_data = {}
        for name, palace in chart.palaces.items():
            palaces_data[name] = {
                "branch": palace.branch,
                "stars": palace.stars,
            }
        return {
            "status": "ok",
            "birth": {
                "year": req.year,
                "lunar_month": req.lunar_month,
                "lunar_day": req.lunar_day,
                "hour": req.hour,
                "gender": req.gender,
            },
            "palaces": palaces_data,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
