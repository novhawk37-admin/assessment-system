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
class AssessmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    assessment_type: Optional[str] = None
    duration: int
    total_marks: int = 0
    passing_marks: int = 0


class AssessmentCreate(AssessmentBase):
    pass


class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assessment_type: Optional[str] = None
    duration: Optional[int] = None
    total_marks: Optional[int] = None
    passing_marks: Optional[int] = None

class AssignAssessment(BaseModel):
    assessment_id: int
    user_ids: list[int]

# ---------- Questions ----------
class QuestionBase(BaseModel):
    assessment_id: int
    question: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    correct_answer: str
    marks: Optional[int] = 1


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    question: Optional[str] = None

    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None

    correct_answer: Optional[str] = None
    marks: Optional[int] = None


class QuestionOut(QuestionBase):
    id: int

    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    id: int
    question: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    marks: int
    correct_answer: str | None = None

    class Config:
        from_attributes = True

class AssessmentResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    duration: int
    questions: list[QuestionResponse]

    class Config:
        from_attributes = True

class AnswerSubmit(BaseModel):
    question_id: int
    selected_answer: str


class AssessmentSubmit(BaseModel):
    answers: List[AnswerSubmit]

# ---------- User Assessment ----------
class UserAssessmentBase(BaseModel):
    user_id: int
    assessment_id: int

    score: Optional[int] = 0
    total_questions: Optional[int] = 0
    correct_answers: Optional[int] = 0

    status: Optional[str] = "Not Started"

    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None


class UserAssessmentCreate(UserAssessmentBase):
    pass


class UserAssessmentUpdate(BaseModel):
    score: Optional[int] = None
    total_questions: Optional[int] = None
    correct_answers: Optional[int] = None

    status: Optional[str] = None

    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None


class UserAssessmentOut(UserAssessmentBase):
    id: int

    class Config:
        from_attributes = True

# ---------- User Answer ----------
class UserAnswerBase(BaseModel):
    user_assessment_id: int
    question_id: int

    selected_answer: Optional[str] = None
    is_correct: Optional[bool] = False


class UserAnswerCreate(UserAnswerBase):
    pass


class UserAnswerUpdate(BaseModel):
    selected_answer: Optional[str] = None
    is_correct: Optional[bool] = None


class UserAnswerOut(UserAnswerBase):
    id: int

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
