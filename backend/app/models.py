import enum
from datetime import datetime
from sqlalchemy.sql import func
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Text,
    TIMESTAMP
)

from sqlalchemy.orm import relationship

from app.database import Base


class RoleEnum(str, enum.Enum):
    user = "user"
    admin = "admin"


class TaskStatus(str, enum.Enum):
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"


class AssessmentType(str, enum.Enum):
    technical = "Technical"
    aptitude = "Aptitude"
    coding = "Coding"
    communication = "Communication"


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "novhawk_assessment"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.user)
    title = Column(String(120), default="Software Developer")
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship(
        "Task",
        back_populates="assignee",
        cascade="all, delete-orphan"
    )

    assessments = relationship(
        "Assessment",
        back_populates="creator",
        cascade="all, delete"
    )

    user_assessments = relationship(
        "UserAssessment",
        back_populates="user",
        cascade="all, delete"
    )

    assigned_assessments = relationship(
        "AssessmentAssignment",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = {"schema": "novhawk_assessment"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(120), nullable=True)
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.assigned)
    due_date = Column(DateTime, nullable=True)
    assignee_id = Column(Integer, ForeignKey("novhawk_assessment.users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    github_link = Column(Text, nullable=True)
    upload_image = Column(Text, nullable=True)

    assignee = relationship("User", back_populates="tasks")


class Assessment(Base):
    __tablename__ = "assessments"
    __table_args__ = {"schema": "novhawk_assessment"}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    assessment_type = Column(String(50))
    duration = Column(Integer, nullable=False)
    total_marks = Column(Integer, default=0)
    passing_marks = Column(Integer, default=0)

    created_by = Column(
        Integer,
        ForeignKey("novhawk_assessment.users.id")
    )

    created_at = Column(
        TIMESTAMP(timezone=False),
        server_default=func.now()
    )

    creator = relationship("User", back_populates="assessments")

    questions = relationship(
        "Question",
        back_populates="assessment",
        cascade="all, delete"
    )

    user_assessments = relationship(
        "UserAssessment",
        back_populates="assessment",
        cascade="all, delete"
    )

    assignments = relationship(
        "AssessmentAssignment",
        back_populates="assessment",
        cascade="all, delete-orphan"
    )


class AssessmentAssignment(Base):
    __tablename__ = "assessment_assignments"
    __table_args__ = {"schema": "novhawk_assessment"}

    id = Column(Integer, primary_key=True, index=True)

    assessment_id = Column(
        Integer,
        ForeignKey("novhawk_assessment.assessments.id", ondelete="CASCADE"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("novhawk_assessment.users.id", ondelete="CASCADE"),
        nullable=False
    )

    assigned_at = Column(DateTime, server_default=func.now())

    status = Column(String, default="assigned")

    completed_at = Column(DateTime)

    score = Column(Float)

    assessment = relationship("Assessment", back_populates="assignments")
    user = relationship("User", back_populates="assigned_assessments")


class Question(Base):
    __tablename__ = "questions"
    __table_args__ = {"schema": "novhawk_assessment"}

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(
        Integer,
        ForeignKey("novhawk_assessment.assessments.id", ondelete="CASCADE"),
        nullable=False
    )

    question = Column(Text, nullable=False)

    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)

    correct_answer = Column(String(1), nullable=False)

    marks = Column(Integer, default=1)

    assessment = relationship("Assessment", back_populates="questions")

    user_answers = relationship(
        "UserAnswer",
        back_populates="question",
        cascade="all, delete"
    )


class UserAssessment(Base):
    __tablename__ = "user_assessments"
    __table_args__ = {"schema": "novhawk_assessment"}

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("novhawk_assessment.users.id", ondelete="CASCADE"),
        nullable=False
    )

    assessment_id = Column(
        Integer,
        ForeignKey("novhawk_assessment.assessments.id", ondelete="CASCADE"),
        nullable=False
    )

    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)

    status = Column(String(20), default="Not Started")

    started_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="user_assessments")
    assessment = relationship("Assessment", back_populates="user_assessments")

    user_answers = relationship(
        "UserAnswer",
        back_populates="user_assessment",
        cascade="all, delete"
    )


class UserAnswer(Base):
    __tablename__ = "user_answers"
    __table_args__ = {"schema": "novhawk_assessment"}

    id = Column(Integer, primary_key=True, index=True)

    user_assessment_id = Column(
        Integer,
        ForeignKey("novhawk_assessment.user_assessments.id", ondelete="CASCADE"),
        nullable=False
    )

    question_id = Column(
        Integer,
        ForeignKey("novhawk_assessment.questions.id", ondelete="CASCADE"),
        nullable=False
    )

    selected_answer = Column(String(1), nullable=True)

    is_correct = Column(Boolean, default=False)

    user_assessment = relationship(
        "UserAssessment",
        back_populates="user_answers"
    )

    question = relationship(
        "Question",
        back_populates="user_answers"
    )


class Activity(Base):
    __tablename__ = "activities"
    __table_args__ = {"schema": "novhawk_assessment"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("novhawk_assessment.users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")