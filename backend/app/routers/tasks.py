from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _to_out(task: models.Task) -> schemas.TaskOut:
    return schemas.TaskOut(
        id=task.id,
        title=task.title,
        description = task.description,
        category=task.category,
        status=task.status.value if hasattr(task.status, "value") else task.status,
        due_date=task.due_date,
        assignee_id=task.assignee_id,
        assignee_name=task.assignee.name if task.assignee else None,
        created_at=task.created_at,
    )


@router.get("", response_model=List[schemas.TaskOut])
def list_tasks(
    mine: bool = False,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Task)
    if mine or current_user.role != models.RoleEnum.admin:
        query = query.filter(models.Task.assignee_id == current_user.id)
    if status_filter:
        query = query.filter(models.Task.status == status_filter)
    tasks = query.order_by(models.Task.due_date.asc().nullslast()).all()
    return [_to_out(t) for t in tasks]


@router.post("", response_model=schemas.TaskOut)
def create_task(
    payload: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    task = models.Task(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        due_date=payload.due_date,
        assignee_id=payload.assignee_id,
        status=payload.status or "assigned",
    )
    db.add(task)
    db.add(models.Activity(description=f"New task '{payload.title}' created by Admin", user_id=current_user.id))
    db.commit()
    db.refresh(task)
    return _to_out(task)


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    payload: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != models.RoleEnum.admin and task.assignee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    data = payload.model_dump(exclude_unset=True)
    was_completed = task.status == models.TaskStatus.completed
    for field, value in data.items():
        setattr(task, field, value)
    if task.status == models.TaskStatus.completed and not was_completed:
        task.completed_at = datetime.utcnow()
        db.add(models.Activity(description=f"User '{task.assignee.name if task.assignee else 'Unknown'}' completed '{task.title}'", user_id=task.assignee_id))

    db.commit()
    db.refresh(task)
    return _to_out(task)


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"ok": True}
