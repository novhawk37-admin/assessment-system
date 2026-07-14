from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

from app.models import AssessmentType


# ---------- Auth ----------
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"
    title: Optional[str] = "Software Developer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    title: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Tasks ----------
class TaskCreate(BaseModel):
    title: str
    category: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None
    status: Optional[str] = "assigned"


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None
    status: Optional[str] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: str
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None
    assignee_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Assessments ----------
class AssessmentCreate(BaseModel):
    name: str
    type: AssessmentType
    score: float
    user_id: Optional[int] = None


class AssessmentOut(BaseModel):
    id: int
    name: str
    type: AssessmentType
    score: float
    user_id: Optional[int] = None
    taken_at: datetime

    class Config:
        from_attributes = True


# ---------- Dashboard ----------
class UserDashboardOut(BaseModel):
    tasks_assigned: int
    tasks_due_today: int
    tasks_completed: int
    tasks_completed_this_week: int
    assessments_completed: int
    assessments_completed_this_week: int
    overall_progress: float
    my_tasks: List[TaskOut]
    average_assessment_score: float
    assessment_breakdown: List[dict]
    upcoming_deadlines: List[TaskOut]


class AdminDashboardOut(BaseModel):
    total_users: int
    total_users_this_week: int
    total_tasks: int
    total_tasks_this_week: int
    assessments_conducted: int
    assessments_conducted_this_week: int
    completion_rate: float
    task_overview: List[dict]
    assessment_analytics: List[dict]
    top_performing_users: List[dict]
    recent_activities: List[dict]
