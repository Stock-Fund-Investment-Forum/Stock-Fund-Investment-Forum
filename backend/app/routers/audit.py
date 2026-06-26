from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/logs", response_model=List[schemas.AuditLogOut])
def list_audit_logs(
    target_type: str = Query(None),
    target_id: str = Query(None),
    actor_id: str = Query(None),
    audit_id: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * per_page
    return crud.get_audit_logs(
        db,
        target_type=target_type,
        target_id=target_id,
        actor_id=actor_id,
        audit_id=audit_id,
        skip=skip,
        limit=per_page,
    )


@router.post("/violations", response_model=schemas.ViolationOut, status_code=201)
def report_violation(
    v: schemas.ViolationCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    viol = crud.create_violation(db, v, reporter_id=current_user.user_id)
    return viol


@router.get("/violations", response_model=List[schemas.ViolationOut])
def list_violations(
    status: str = Query(None),
    target_id: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    violation_id: str = Query(None),
):
    skip = (page - 1) * per_page
    return crud.get_violations(
        db,
        status=status,
        target_id=target_id,
        violation_id=violation_id,
        skip=skip,
        limit=per_page,
    )


@router.post("/violations/{violation_id}/resolve", response_model=schemas.ViolationOut)
def resolve_violation(
    violation_id: str,
    status: models.AuditStatus = Query(models.AuditStatus.APPROVED),
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    # TODO: check admin permission
    v = crud.resolve_violation(
        db,
        violation_id,
        resolver_id=current_user.user_id,
        status=status,
    )
    if not v:
        raise HTTPException(status_code=404, detail="Violation not found")
    return v
