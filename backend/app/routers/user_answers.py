from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(
    prefix="/api/user-answers",
    tags=["User Answers"]
)


@router.post("", response_model=schemas.UserAnswerOut)
def create_user_answer(
    data: schemas.UserAnswerCreate,
    db: Session = Depends(get_db),
):
    user_assessment = db.query(models.UserAssessment).filter(
        models.UserAssessment.id == data.user_assessment_id
    ).first()

    if not user_assessment:
        raise HTTPException(status_code=404, detail="User Assessment not found")

    question = db.query(models.Question).filter(
        models.Question.id == data.question_id
    ).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    answer = models.UserAnswer(**data.model_dump())

    db.add(answer)
    db.commit()
    db.refresh(answer)

    return answer


@router.get("", response_model=List[schemas.UserAnswerOut])
def get_all_user_answers(
    db: Session = Depends(get_db),
):
    return db.query(models.UserAnswer).all()


@router.get("/{answer_id}", response_model=schemas.UserAnswerOut)
def get_user_answer(
    answer_id: int,
    db: Session = Depends(get_db),
):
    answer = db.query(models.UserAnswer).filter(
        models.UserAnswer.id == answer_id
    ).first()

    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    return answer


@router.get("/assessment/{user_assessment_id}", response_model=List[schemas.UserAnswerOut])
def get_answers_by_assessment(
    user_assessment_id: int,
    db: Session = Depends(get_db),
):
    return db.query(models.UserAnswer).filter(
        models.UserAnswer.user_assessment_id == user_assessment_id
    ).all()


@router.put("/{answer_id}", response_model=schemas.UserAnswerOut)
def update_user_answer(
    answer_id: int,
    data: schemas.UserAnswerUpdate,
    db: Session = Depends(get_db),
):
    answer = db.query(models.UserAnswer).filter(
        models.UserAnswer.id == answer_id
    ).first()

    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(answer, key, value)

    db.commit()
    db.refresh(answer)

    return answer


@router.delete("/{answer_id}")
def delete_user_answer(
    answer_id: int,
    db: Session = Depends(get_db),
):
    answer = db.query(models.UserAnswer).filter(
        models.UserAnswer.id == answer_id
    ).first()

    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    db.delete(answer)
    db.commit()

    return {"message": "Answer deleted successfully"}


@router.get("/{assessment_id}/answers")
def assessment_answers(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    user_assessment = (
        db.query(models.UserAssessment)
        .filter(
            models.UserAssessment.assessment_id == assessment_id,
            models.UserAssessment.user_id == current_user.id,
        )
        .first()
    )

    if not user_assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    result = []

    for answer in user_assessment.user_answers:

        question = answer.question

        options = {
            "A": question.option_a,
            "B": question.option_b,
            "C": question.option_c,
            "D": question.option_d,
        }

        result.append({
            "question_id": question.id,
            "question": question.question,

            "option_a": question.option_a,
            "option_b": question.option_b,
            "option_c": question.option_c,
            "option_d": question.option_d,

            "selected_answer": answer.selected_answer,
            "selected_text": options.get(answer.selected_answer),

            "correct_answer": question.correct_answer,
            "correct_text": options.get(question.correct_answer),

            "is_correct": answer.is_correct,
        })

    return result