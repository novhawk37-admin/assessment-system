from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


@router.get("", response_model=List[schemas.AssessmentOut])
def list_assessments(
    mine: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Assessment)
    if mine or current_user.role != models.RoleEnum.admin:
        query = query.filter(models.Assessment.user_id == current_user.id)
    items = query.order_by(models.Assessment.taken_at.desc()).all()
    return [schemas.AssessmentOut.model_validate(a) for a in items]


@router.post("", response_model=schemas.AssessmentOut)
def create_assessment(
    payload: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    assessment = models.Assessment(
        name=payload.name,
        type=payload.type,
        score=payload.score,
        user_id=payload.user_id,
    )
    db.add(assessment)
    db.add(models.Activity(description=f"Assessment '{payload.name}' created by Admin", user_id=current_user.id))
    db.commit()
    db.refresh(assessment)
    return schemas.AssessmentOut.model_validate(assessment)


@router.delete("/{assessment_id}")
def delete_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    item = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(item)
    db.commit()
    return {"ok": True}
