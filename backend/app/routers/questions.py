from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/api/questions",
    tags=["Questions"]
)


# Create Question
@router.post("", response_model=schemas.QuestionOut)
def create_question(
    question: schemas.QuestionCreate,
    db: Session = Depends(get_db),
):
    assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.id == question.assessment_id)
        .first()
    )

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    db_question = models.Question(**question.model_dump())

    db.add(db_question)
    db.commit()
    db.refresh(db_question)

    return db_question


# Get All Questions
@router.get("", response_model=List[schemas.QuestionOut])
def get_questions(db: Session = Depends(get_db)):
    return db.query(models.Question).all()


# Get Questions by Assessment
@router.get("/assessment/{assessment_id}", response_model=List[schemas.QuestionOut])
def get_questions_by_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Question)
        .filter(models.Question.assessment_id == assessment_id)
        .all()
    )


# Get Single Question
@router.get("/{question_id}", response_model=schemas.QuestionOut)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
):
    question = (
        db.query(models.Question)
        .filter(models.Question.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    return question


# Update Question
@router.put("/{question_id}", response_model=schemas.QuestionOut)
def update_question(
    question_id: int,
    data: schemas.QuestionUpdate,
    db: Session = Depends(get_db),
):
    question = (
        db.query(models.Question)
        .filter(models.Question.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(question, key, value)

    db.commit()
    db.refresh(question)

    return question


# Delete Question
@router.delete("/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
):
    question = (
        db.query(models.Question)
        .filter(models.Question.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(question)
    db.commit()

    return {"message": "Question deleted successfully"}