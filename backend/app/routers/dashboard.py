from datetime import datetime, timedelta, date
from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin
from app.routers.tasks import _to_out

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/user", response_model=schemas.UserDashboardOut)
def user_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    today_start = datetime(now.year, now.month, now.day)
    today_end = today_start + timedelta(days=1)

    all_tasks = db.query(models.Task).filter(models.Task.assignee_id == current_user.id).all()
    tasks_assigned = len(all_tasks)
    completed_tasks = [t for t in all_tasks if t.status == models.TaskStatus.completed]
    tasks_completed = len(completed_tasks)
    tasks_completed_this_week = len(
        [t for t in completed_tasks if t.completed_at and t.completed_at >= week_ago]
    )
    tasks_due_today = len(
        [
            t
            for t in all_tasks
            if t.status != models.TaskStatus.completed
            and t.due_date
            and today_start <= t.due_date < today_end
        ]
    )

    assessments = (
        db.query(models.Assessment).filter(models.Assessment.user_id == current_user.id).all()
    )
    assessments_completed = len(assessments)
    assessments_completed_this_week = len(
        [a for a in assessments if a.taken_at and a.taken_at >= week_ago]
    )
    average_assessment_score = (
        round(sum(a.score for a in assessments) / len(assessments), 1) if assessments else 0
    )

    breakdown = defaultdict(list)
    for a in assessments:
        breakdown[a.type.value if hasattr(a.type, "value") else a.type].append(a.score)
    assessment_breakdown = [
        {"type": t, "score": round(sum(v) / len(v), 1)} for t, v in breakdown.items()
    ]

    task_completion_rate = (tasks_completed / tasks_assigned * 100) if tasks_assigned else 0
    overall_progress = round(task_completion_rate * 0.6 + average_assessment_score * 0.4, 1)

    pending_tasks = sorted(
        [t for t in all_tasks if t.status != models.TaskStatus.completed],
        key=lambda t: t.due_date or (now + timedelta(days=999)),
    )
    my_tasks = [_to_out(t) for t in pending_tasks[:6]]
    upcoming_deadlines = [_to_out(t) for t in pending_tasks[:4]]

    return schemas.UserDashboardOut(
        tasks_assigned=tasks_assigned,
        tasks_due_today=tasks_due_today,
        tasks_completed=tasks_completed,
        tasks_completed_this_week=tasks_completed_this_week,
        assessments_completed=assessments_completed,
        assessments_completed_this_week=assessments_completed_this_week,
        overall_progress=overall_progress,
        my_tasks=my_tasks,
        average_assessment_score=average_assessment_score,
        assessment_breakdown=assessment_breakdown,
        upcoming_deadlines=upcoming_deadlines,
    )


@router.get("/admin", response_model=schemas.AdminDashboardOut)
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    all_users = db.query(models.User).all()
    total_users = len(all_users)
    total_users_this_week = len([u for u in all_users if u.created_at and u.created_at >= week_ago])

    all_tasks = db.query(models.Task).all()
    total_tasks = len(all_tasks)
    total_tasks_this_week = len([t for t in all_tasks if t.created_at and t.created_at >= week_ago])
    completed_tasks = [t for t in all_tasks if t.status == models.TaskStatus.completed]
    completion_rate = round((len(completed_tasks) / total_tasks * 100), 1) if total_tasks else 0

    all_assessments = db.query(models.Assessment).all()
    assessments_conducted = len(all_assessments)
    assessments_conducted_this_week = len(
        [a for a in all_assessments if a.taken_at and a.taken_at >= week_ago]
    )

    # Task overview: last 7 days, assigned vs completed counts per day
    day_buckets = []
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date()
        day_buckets.append(day)

    assigned_by_day = defaultdict(int)
    completed_by_day = defaultdict(int)
    for t in all_tasks:
        if t.created_at:
            assigned_by_day[t.created_at.date()] += 1
        if t.completed_at:
            completed_by_day[t.completed_at.date()] += 1

    task_overview = [
        {
            "date": d.strftime("%b %d"),
            "assigned": assigned_by_day.get(d, 0),
            "completed": completed_by_day.get(d, 0),
        }
        for d in day_buckets
    ]

    # Assessment analytics: totals per type
    type_counts = defaultdict(int)
    for a in all_assessments:
        type_counts[a.type.value if hasattr(a.type, "value") else a.type] += 1
    assessment_analytics = [{"type": t, "count": c} for t, c in type_counts.items()]

    # Top performing users: blend of task completion rate + avg assessment score
    user_scores = []
    for u in all_users:
        if u.role == models.RoleEnum.admin:
            continue
        u_tasks = [t for t in all_tasks if t.assignee_id == u.id]
        u_completed = [t for t in u_tasks if t.status == models.TaskStatus.completed]
        rate = (len(u_completed) / len(u_tasks) * 100) if u_tasks else 0
        u_assessments = [a for a in all_assessments if a.user_id == u.id]
        avg_score = (
            sum(a.score for a in u_assessments) / len(u_assessments) if u_assessments else 0
        )
        blended = round(rate * 0.5 + avg_score * 0.5, 1)
        user_scores.append(
            {
                "id": u.id,
                "name": u.name,
                "title": u.title,
                "progress": blended,
            }
        )
    top_performing_users = sorted(user_scores, key=lambda x: x["progress"], reverse=True)[:5]

    recent_activities = (
        db.query(models.Activity).order_by(models.Activity.created_at.desc()).limit(6).all()
    )
    recent_activities_out = [
        {
            "description": a.description,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in recent_activities
    ]

    return schemas.AdminDashboardOut(
        total_users=total_users,
        total_users_this_week=total_users_this_week,
        total_tasks=total_tasks,
        total_tasks_this_week=total_tasks_this_week,
        assessments_conducted=assessments_conducted,
        assessments_conducted_this_week=assessments_conducted_this_week,
        completion_rate=completion_rate,
        task_overview=task_overview,
        assessment_analytics=assessment_analytics,
        top_performing_users=top_performing_users,
        recent_activities=recent_activities_out,
    )
