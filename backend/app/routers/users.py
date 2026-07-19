from typing import List
from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import require_admin, get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("")
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()

    result = []

    for user in users:

        best_assignment = (
            db.query(models.AssessmentAssignment)
            .filter(models.AssessmentAssignment.user_id == user.id)
            .order_by(models.AssessmentAssignment.score.desc())
            .first()
        )

        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "title": user.title,
            "score": best_assignment.score if best_assignment else 0,
            "status": best_assignment.status if best_assignment else "Not Assigned",
        })

    return result


@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db.delete(user)
    db.commit()
    return {"ok": True}


@router.get("/{user_id}/assessment-history")
def get_user_assessment_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    assessments = (
        db.query(models.UserAssessment)
        .filter(models.UserAssessment.user_id == user_id)
        .all()
    )

    result = []

    ist = ZoneInfo("Asia/Kolkata")

    for ua in assessments:

        submitted_at_ist = None

        if ua.submitted_at:
            utc_time = ua.submitted_at.replace(tzinfo=ZoneInfo("UTC"))
            submitted_at_ist = utc_time.astimezone(ist)


        # Calculate percentage
        total_questions = len(ua.assessment.questions)

        percentage = 0

        if total_questions > 0:
            percentage = round((ua.score / total_questions) * 100, 2)


        result.append({
            "user_assessment_id": ua.id,
            "assessment_title": ua.assessment.title,
            "score": f"{percentage}",
            "status": ua.status,
            "submitted_at": submitted_at_ist.strftime("%Y-%m-%d %H:%M:%S")
                if submitted_at_ist else None,
        })

    return result