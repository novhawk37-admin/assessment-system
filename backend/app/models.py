import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    Enum,
    Text,
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

    assignee = relationship("User", back_populates="tasks")


class Assessment(Base):
    __tablename__ = "assessments"
    __table_args__ = {"schema": "novhawk_assessment"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    type = Column(
        Enum(
            AssessmentType,
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
            name="assessmenttype",
        ),
        nullable=False,
    )
    score = Column(Float, nullable=False, default=0)
    user_id = Column(Integer, ForeignKey("novhawk_assessment.users.id"), nullable=True)
    taken_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")


class Activity(Base):
    __tablename__ = "activities"
    __table_args__ = {"schema": "novhawk_assessment"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("novhawk_assessment.users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")