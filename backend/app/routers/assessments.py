from typing import List
from sqlalchemy.orm import joinedload
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])


# Get all assessments
@router.get("")
def list_assessments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    assessments = (
        db.query(models.Assessment)
        .options(joinedload(models.Assessment.questions))
        .order_by(models.Assessment.created_at.desc())
        .all()
    )

    result = []

    for assessment in assessments:

        assignments = (
            db.query(models.AssessmentAssignment)
            .filter(
                models.AssessmentAssignment.assessment_id == assessment.id
            )
            .all()
        )

        assigned = len(assignments)
        submitted = len([a for a in assignments if a.status == "Submitted"])

        result.append({
            "id": assessment.id,
            "title": assessment.title,
            "description": assessment.description,
            "duration": assessment.duration,
            "total_questions": len(assessment.questions),
            "assigned_users": len(assignments),
            "submitted_users": submitted,
        })
        

    return result


# Create assessment
@router.post("", response_model=schemas.AssessmentResponse)
def create_assessment(
    payload: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    assessment = models.Assessment(
        title=payload.title,
        description=payload.description,
        assessment_type=payload.assessment_type,
        duration=payload.duration,
        total_marks=payload.total_marks,
        passing_marks=payload.passing_marks,
        created_by=current_user.id,
    )

    db.add(assessment)

    db.add(
        models.Activity(
            description=f"Assessment '{payload.title}' created by Admin",
            user_id=current_user.id,
        )
    )

    db.commit()
    db.refresh(assessment)

    return schemas.AssessmentResponse.model_validate(assessment)


# Update assessment
@router.put("/{assessment_id}", response_model=schemas.AssessmentResponse)
def update_assessment(
    assessment_id: int,
    payload: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.id == assessment_id)
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found",
        )

    assessment.title = payload.title
    assessment.description = payload.description
    assessment.assessment_type = payload.assessment_type
    assessment.duration = payload.duration
    assessment.total_marks = payload.total_marks
    assessment.passing_marks = payload.passing_marks

    db.commit()
    db.refresh(assessment)

    return schemas.AssessmentResponse.model_validate(assessment)


# Delete assessment
@router.delete("/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.id == assessment_id)
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found",
        )

    db.delete(assessment)
    db.commit()

    return {"message": "Assessment deleted successfully"}


@router.get("/{assessment_id}", response_model=schemas.AssessmentResponse)
def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db)
):

    assessment = (
        db.query(models.Assessment)
        .options(
            joinedload(models.Assessment.questions)
        )
        .filter(
            models.Assessment.id == assessment_id
        )
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    return assessment