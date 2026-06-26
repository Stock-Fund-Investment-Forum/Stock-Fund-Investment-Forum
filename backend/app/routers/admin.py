from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])

# ========== Certification ==========

@router.post("/certifications", response_model=schemas.CertOut, status_code=201)
def submit_certification(
    cert: schemas.CertCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    return crud.create_certification(
        db, user_id=current_user.user_id, cert_type=cert.cert_type,
        file_path=f"uploads/{cert.cert_type}_{current_user.user_id}", description=cert.description,
    )


@router.get("/certifications", response_model=List[schemas.CertOut])
def list_certifications(
    status: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * per_page
    return crud.list_certifications(db, status=status, skip=skip, limit=per_page)


@router.post("/certifications/{cert_id}/review", status_code=200)
def review_certification(
    cert_id: str,
    action: str = Query(..., regex="^(APPROVED|REJECTED)$"),
    remark: str = Query(None),
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    cert = crud.review_certification(db, cert_id, status=action, reviewed_by=current_user.user_id, remark=remark)
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    return {"detail": f"Certification {action}", "cert_id": cert_id}


# ========== Risk Assessment ==========

@router.post("/risk-assessments", response_model=schemas.RiskAssessmentOut, status_code=201)
def submit_risk_assessment(
    assessment: schemas.RiskAssessmentCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    import json
    score = 0
    for a in assessment.answers:
        ans = a.answer.strip().lower()
        if ans in ("是", "yes", "同意", "能承受", "5年以上", "80%以上", "股票", "期货", "期权"):
            score += 3
        elif ans in ("不确定", "一般", "中等", "3-5年", "50%-80%", "基金", "债券"):
            score += 2
        elif ans in ("否", "no", "不同意", "不能承受", "1年以下", "20%以下", "存款", "货币"):
            score += 1
        else:
            score += 2
    if score >= 20:
        risk_level = "进取型"
    elif score >= 12:
        risk_level = "稳健型"
    else:
        risk_level = "保守型"
    answers_json = json.dumps([a.model_dump() for a in assessment.answers], ensure_ascii=False)
    return crud.create_risk_assessment(db, user_id=current_user.user_id, answers=answers_json, score=score, risk_level=risk_level)


@router.get("/risk-assessments", response_model=List[schemas.RiskAssessmentOut])
def list_risk_assessments(
    status: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * per_page
    return crud.list_risk_assessments(db, status=status, skip=skip, limit=per_page)


@router.post("/risk-assessments/{assessment_id}/review", status_code=200)
def review_risk_assessment(
    assessment_id: str,
    action: str = Query(..., regex="^(APPROVED|REJECTED)$"),
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    assessment = crud.review_risk_assessment(db, assessment_id, status=action, reviewed_by=current_user.user_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Risk assessment not found")
    return {"detail": f"Assessment {action}", "assessment_id": assessment_id}


# ========== Dashboard Stats ==========

@router.get("/stats")
def admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(models.User).filter(models.User.is_deleted == False).count()
    total_posts = db.query(models.Post).filter(models.Post.is_deleted == False).count()
    total_comments = db.query(models.Comment).filter(models.Comment.is_deleted == False).count()
    pending_violations = db.query(models.Violation).filter(models.Violation.status == "PENDING").count()
    today = func.date(func.now())
    today_posts = db.query(models.Post).filter(func.date(models.Post.created_at) == today).count()
    today_users = db.query(models.User).filter(func.date(models.User.created_at) == today).count()
    banned_users = db.query(models.User).filter(models.User.status == "BANNED").count()
    certified = db.query(models.User).filter(models.User.auth_level == "EXPERT").count()
    return {
        "total_users": total_users, "total_posts": total_posts, "total_comments": total_comments,
        "pending_violations": pending_violations, "today_posts": today_posts, "today_users": today_users,
        "banned_users": banned_users, "certified_users": certified,
    }


# ========== User Management ==========

@router.get("/users", response_model=List[dict])
def list_admin_users(
    q: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(models.User).filter(models.User.is_deleted == False)
    if q:
        like = f"%{q}%"
        query = query.filter(models.User.nickname.ilike(like) | models.User.email.ilike(like))
    users = query.order_by(models.User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return [
        {
            "user_id": u.user_id, "nickname": u.nickname, "email": u.email, "phone": u.phone,
            "level": u.level or 1, "points": u.points or 0, "status": u.status.value if hasattr(u.status, 'value') else (u.status or "ACTIVE"),
            "auth_level": u.auth_level.value if hasattr(u.auth_level, 'value') else (u.auth_level or "UNVERIFIED"),
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.post("/users/{user_id}/status")
def update_user_status(
    user_id: str,
    status: str = Query(..., regex="^(ACTIVE|SUSPENDED|BANNED|INACTIVE)$"),
    reason: str = Query(None),
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = status
    db.commit()
    if reason:
        crud.create_audit_log(db, actor_id=current_user.user_id, target_type="USER",
                              target_id=user_id, action=f"STATUS_{status}", details=reason)
    return {"detail": f"User status updated to {status}"}


# ========== Violation Management ==========

@router.get("/violations", response_model=List[schemas.ViolationOut])
def list_admin_violations(
    status: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return crud.get_violations(db, status=status, skip=(page - 1) * per_page, limit=per_page)


@router.post("/violations/{violation_id}/review")
def resolve_admin_violation(
    violation_id: str,
    action: str = Query(..., regex="^(APPROVED|REJECTED|FLAGGED)$"),
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    v = crud.resolve_violation(db, violation_id, resolver_id=current_user.user_id, status=action)
    if not v:
        raise HTTPException(status_code=404, detail="Violation not found")
    return {"detail": f"Violation {action}", "violation_id": violation_id}


# ========== Audit Logs ==========

@router.get("/audit-logs", response_model=List[schemas.AuditLogOut])
def list_admin_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return crud.get_audit_logs(db, skip=(page - 1) * per_page, limit=per_page)