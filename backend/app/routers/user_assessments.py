from typing import List
from sqlalchemy.orm import joinedload
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin


router = APIRouter(
    prefix="/api/user-assessments",
    tags=["User Assessments"]
)


# Assign assessment to users
@router.post("/assign")
def assign_assessment(
    payload: schemas.AssignAssessment,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):

    for user_id in payload.user_ids:

        existing = (
            db.query(models.AssessmentAssignment)
            .filter(
                models.AssessmentAssignment.user_id == user_id,
                models.AssessmentAssignment.assessment_id == payload.assessment_id
            )
            .first()
        )

        if existing:
            continue

        assignment = models.AssessmentAssignment(
            user_id=user_id,
            assessment_id=payload.assessment_id,
            status="assigned"
        )

        db.add(assignment)


    db.commit()


    return {
        "message":"Assessment assigned successfully"
    }


# User assigned assessments

@router.get("/my-assessments")
def my_assessments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    records = (
        db.query(models.AssessmentAssignment)
        .options(
            joinedload(models.AssessmentAssignment.assessment)
            .joinedload(models.Assessment.questions)
        )
        .filter(models.AssessmentAssignment.user_id == current_user.id)
        .all()
    )

    return [
        {
            "id": r.assessment.id,
            "title": r.assessment.title,
            "description": r.assessment.description,
            "status": r.status,
            "duration": r.assessment.duration,
            "score": r.score if r.score is not None else 0,
            "total_questions": len(r.assessment.questions),
        }
        for r in records
    ]


# Submit assessment
@router.post("/{assessment_id}/submit")
def submit_assessment(
    assessment_id: int,
    data: schemas.AssessmentSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    # Get user's assessment attempt
    user_assessment = (
        db.query(models.UserAssessment)
        .filter(
            models.UserAssessment.user_id == current_user.id,
            models.UserAssessment.assessment_id == assessment_id,
        )
        .first()
    )

    if not user_assessment:

        total_questions = (
            db.query(models.Question)
            .filter(
                models.Question.assessment_id == assessment_id
            )
            .count()
        )

        user_assessment = models.UserAssessment(
            user_id=current_user.id,
            assessment_id=assessment_id,
            status="Started",
            started_at=datetime.utcnow(),
            total_questions=total_questions
        )

        db.add(user_assessment)
        db.commit()
        db.refresh(user_assessment)

    # Prevent duplicate submissions
    if user_assessment.status == "Submitted":
        raise HTTPException(
            status_code=400,
            detail="Assessment already submitted"
        )

    score = 0
    total_marks = 0
    correct_count = 0
    total_questions = 0

    # Remove old answers if they exist
    db.query(models.UserAnswer).filter(
        models.UserAnswer.user_assessment_id == user_assessment.id
    ).delete()

    for answer in data.answers:

        question = (
            db.query(models.Question)
            .filter(
                models.Question.id == answer.question_id,
                models.Question.assessment_id == assessment_id
            )
            .first()
        )

        if not question:
            continue

        total_questions += 1
        total_marks += question.marks

        is_correct = (
            question.correct_answer.upper()
            == answer.selected_answer.upper()
        )

        if is_correct:
            score += question.marks
            correct_count += 1

        db.add(
            models.UserAnswer(
                user_assessment_id=user_assessment.id,
                question_id=question.id,
                selected_answer=answer.selected_answer,
                is_correct=is_correct,
            )
        )

    percentage = (
        (score / total_marks) * 100
        if total_marks > 0
        else 0
    )

    # Update UserAssessment
    user_assessment.score = score
    user_assessment.total_questions = total_questions
    user_assessment.correct_answers = correct_count
    user_assessment.status = "Submitted"
    user_assessment.submitted_at = datetime.utcnow()

    # Update AssessmentAssignment (if using this table)
    assignment = (
        db.query(models.AssessmentAssignment)
        .filter(
            models.AssessmentAssignment.user_id == current_user.id,
            models.AssessmentAssignment.assessment_id == assessment_id,
        )
        .first()
    )

    if assignment:
        assignment.status = "submitted"
        assignment.completed_at = datetime.utcnow()
        assignment.score = percentage

    db.commit()

    return {
        "message": "Assessment submitted successfully",
        "score": score,
        "correct_answers": correct_count,
        "total_questions": total_questions,
        "total_marks": total_marks,
        "percentage": round(percentage, 2),
    }



@router.get("/{assessment_id}/result")
def get_assessment_result(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    user_assessment = (
        db.query(models.UserAssessment)
        .filter(
            models.UserAssessment.user_id == current_user.id,
            models.UserAssessment.assessment_id == assessment_id,
        )
        .first()
    )

    if not user_assessment:
        raise HTTPException(
            status_code=404,
            detail="Result not found"
        )

    assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.id == assessment_id)
        .first()
    )

    wrong_answers = (
        user_assessment.total_questions -
        user_assessment.correct_answers
    )

    percentage = (
        round(
            (user_assessment.score / assessment.total_marks) * 100,
            2
        )
        if assessment.total_marks > 0
        else 0
    )

    return {
        "assessment_title": assessment.title,
        "score": percentage,
        "correct_answers": user_assessment.correct_answers,
        "wrong_answers": wrong_answers,
        "total_questions": user_assessment.total_questions,
        "status": "Passed" if percentage >= 40 else "Failed",
    }
