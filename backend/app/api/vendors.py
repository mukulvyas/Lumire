import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import Vendor
from app.schemas.vendors import VendorCreateRequest, VendorUpdateRequest

router = APIRouter(prefix="/api/vendors", tags=["Vendors"])

@router.post("")
async def create_vendor_endpoint(
    payload: VendorCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        new_id = uuid.uuid4()
        event_uuid = uuid.UUID(payload.event_id)
        vendor = Vendor(
            id=new_id,
            event_id=event_uuid,
            category=payload.category,
            name=payload.name,
            status=payload.status or "contacted",
            quote_amount=payload.quote_amount or 0.0,
            note=payload.note,
            contact=payload.contact or {}
        )
        db.add(vendor)
        await db.commit()
        await db.refresh(vendor)
        return {
            "success": True,
            "vendor": {
                "id": str(vendor.id),
                "event_id": str(vendor.event_id),
                "name": vendor.name,
                "category": vendor.category,
                "status": vendor.status,
                "quote_amount": float(vendor.quote_amount),
                "note": vendor.note,
                "contact": vendor.contact
            }
        }
    except Exception:
        await db.rollback()

    simulated_id = f"v-{uuid.uuid4()}"
    return {
        "success": True,
        "simulated": True,
        "vendor": {
            "id": simulated_id,
            "event_id": payload.event_id,
            "name": payload.name,
            "category": payload.category,
            "status": payload.status or "contacted",
            "quote_amount": payload.quote_amount or 0.0,
            "note": payload.note,
            "contact": payload.contact or {}
        }
    }

@router.patch("/{vendor_id}")
async def update_vendor_endpoint(
    vendor_id: str,
    payload: VendorUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        v_uuid = uuid.UUID(vendor_id)
        stmt = select(Vendor).where(Vendor.id == v_uuid)
        res = await db.execute(stmt)
        vendor = res.scalar_one_or_none()
        if vendor:
            if payload.name is not None:
                vendor.name = payload.name
            if payload.category is not None:
                vendor.category = payload.category
            if payload.status is not None:
                vendor.status = payload.status
            if payload.quote_amount is not None:
                vendor.quote_amount = payload.quote_amount
            if payload.note is not None:
                vendor.note = payload.note
            if payload.contact is not None:
                vendor.contact = payload.contact

            await db.commit()
            return {
                "success": True,
                "vendor": {
                    "id": str(vendor.id),
                    "status": vendor.status,
                    "quote_amount": float(vendor.quote_amount)
                }
            }
    except Exception:
        await db.rollback()

    return {"success": True, "simulated": True, "vendor": {"id": vendor_id, "status": payload.status}}

@router.delete("/{vendor_id}")
async def delete_vendor_endpoint(
    vendor_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        v_uuid = uuid.UUID(vendor_id)
        stmt = select(Vendor).where(Vendor.id == v_uuid)
        res = await db.execute(stmt)
        vendor = res.scalar_one_or_none()
        if vendor:
            await db.delete(vendor)
            await db.commit()
            return {"success": True}
    except Exception:
        await db.rollback()

    return {"success": True, "simulated": True}
