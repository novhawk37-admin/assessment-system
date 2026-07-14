"""
Run this once after the database is created to populate demo data
matching the NovHawk dashboard mockup.

Usage:
    python -m app.seed
"""
from datetime import datetime, timedelta

from app.database import SessionLocal, engine, Base
from app import models
from app.auth import hash_password


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(models.User).count() > 0:
        print("Database already has data. Skipping seed.")
        db.close()
        return

    now = datetime.utcnow()

    admin = models.User(
        name="Admin User",
        email="admin@novhawk.com",
        password_hash=hash_password("admin123"),
        role=models.RoleEnum.admin,
        title="Administrator",
    )

    vishnu = models.User(
        name="R. Vishnu",
        email="vishnu@novhawk.com",
        password_hash=hash_password("password123"),
        role=models.RoleEnum.user,
        title="Software Developer",
    )
    karthik = models.User(
        name="A. Karthik",
        email="karthik@novhawk.com",
        password_hash=hash_password("password123"),
        role=models.RoleEnum.user,
        title="QA Engineer",
    )
    dharshini = models.User(
        name="S. Dharshini",
        email="dharshini@novhawk.com",
        password_hash=hash_password("password123"),
        role=models.RoleEnum.user,
        title="Frontend Developer",
    )
    praveen = models.User(
        name="M. Praveen",
        email="praveen@novhawk.com",
        password_hash=hash_password("password123"),
        role=models.RoleEnum.user,
        title="Backend Developer",
    )
    harini = models.User(
        name="K. Harini",
        email="harini@novhawk.com",
        password_hash=hash_password("password123"),
        role=models.RoleEnum.user,
        title="Intern",
    )

    db.add_all([admin, vishnu, karthik, dharshini, praveen, harini])
    db.commit()
    for u in [admin, vishnu, karthik, dharshini, praveen, harini]:
        db.refresh(u)

    def d(days_from_now):
        return now + timedelta(days=days_from_now)

    tasks = [
        models.Task(title="Build responsive landing page", category="Web Development",
                    status=models.TaskStatus.assigned, due_date=d(0), assignee_id=vishnu.id,
                    created_at=now - timedelta(days=5)),
        models.Task(title="Fix bugs in authentication", category="Bug Fixing",
                    status=models.TaskStatus.assigned, due_date=d(1), assignee_id=vishnu.id,
                    created_at=now - timedelta(days=4)),
        models.Task(title="Integrate payment gateway", category="Backend Development",
                    status=models.TaskStatus.assigned, due_date=d(3), assignee_id=vishnu.id,
                    created_at=now - timedelta(days=3)),
        models.Task(title="Prepare module documentation", category="Documentation",
                    status=models.TaskStatus.assigned, due_date=d(4), assignee_id=vishnu.id,
                    created_at=now - timedelta(days=2)),
        models.Task(title="Set up CI pipeline", category="DevOps",
                    status=models.TaskStatus.completed, due_date=d(-2), assignee_id=vishnu.id,
                    created_at=now - timedelta(days=6), completed_at=now - timedelta(days=1)),
        models.Task(title="Code review for API module", category="Backend Development",
                    status=models.TaskStatus.completed, due_date=d(-3), assignee_id=vishnu.id,
                    created_at=now - timedelta(days=7), completed_at=now - timedelta(days=2)),

        models.Task(title="Write unit tests", category="Testing",
                    status=models.TaskStatus.completed, due_date=d(-1), assignee_id=karthik.id,
                    created_at=now - timedelta(days=4), completed_at=now - timedelta(days=1)),
        models.Task(title="Regression test suite", category="Testing",
                    status=models.TaskStatus.assigned, due_date=d(2), assignee_id=karthik.id,
                    created_at=now - timedelta(days=2)),

        models.Task(title="Build dashboard charts", category="Frontend",
                    status=models.TaskStatus.completed, due_date=d(-1), assignee_id=dharshini.id,
                    created_at=now - timedelta(days=5), completed_at=now - timedelta(days=1)),
        models.Task(title="Style login page", category="Frontend",
                    status=models.TaskStatus.assigned, due_date=d(2), assignee_id=dharshini.id,
                    created_at=now - timedelta(days=1)),

        models.Task(title="Optimize DB queries", category="Backend Development",
                    status=models.TaskStatus.assigned, due_date=d(3), assignee_id=praveen.id,
                    created_at=now - timedelta(days=2)),

        models.Task(title="Onboarding checklist", category="Documentation",
                    status=models.TaskStatus.assigned, due_date=d(5), assignee_id=harini.id,
                    created_at=now - timedelta(days=1)),
    ]
    db.add_all(tasks)

    assessments = [
        models.Assessment(name="Technical Assessment", type=models.AssessmentType.technical, score=80, user_id=vishnu.id, taken_at=now - timedelta(days=6)),
        models.Assessment(name="Aptitude Test", type=models.AssessmentType.aptitude, score=70, user_id=vishnu.id, taken_at=now - timedelta(days=5)),
        models.Assessment(name="Coding Challenge", type=models.AssessmentType.coding, score=60, user_id=vishnu.id, taken_at=now - timedelta(days=3)),
        models.Assessment(name="Communication Test", type=models.AssessmentType.communication, score=90, user_id=vishnu.id, taken_at=now - timedelta(days=1)),

        models.Assessment(name="Technical Assessment", type=models.AssessmentType.technical, score=85, user_id=karthik.id, taken_at=now - timedelta(days=4)),
        models.Assessment(name="Coding Challenge", type=models.AssessmentType.coding, score=82, user_id=karthik.id, taken_at=now - timedelta(days=2)),

        models.Assessment(name="Technical Assessment", type=models.AssessmentType.technical, score=78, user_id=dharshini.id, taken_at=now - timedelta(days=3)),
        models.Assessment(name="Communication Test", type=models.AssessmentType.communication, score=79, user_id=dharshini.id, taken_at=now - timedelta(days=1)),

        models.Assessment(name="Aptitude Test", type=models.AssessmentType.aptitude, score=72, user_id=praveen.id, taken_at=now - timedelta(days=2)),

        models.Assessment(name="Communication Test", type=models.AssessmentType.communication, score=68, user_id=harini.id, taken_at=now - timedelta(days=1)),
    ]
    db.add_all(assessments)

    activities = [
        models.Activity(description="New task 'API Integration' created", user_id=admin.id, created_at=now - timedelta(hours=2)),
        models.Activity(description="Assessment 'Coding Challenge' created", user_id=admin.id, created_at=now - timedelta(hours=5)),
        models.Activity(description="User 'R. Vishnu' completed Technical Assessment", user_id=vishnu.id, created_at=now - timedelta(days=1)),
        models.Activity(description="New user 'A. Karthik' joined the platform", user_id=karthik.id, created_at=now - timedelta(days=1)),
        models.Activity(description="User 'S. Dharshini' completed 'Build dashboard charts'", user_id=dharshini.id, created_at=now - timedelta(days=2)),
    ]
    db.add_all(activities)

    db.commit()
    db.close()
    print("Seed complete.")
    print("Admin login:  admin@novhawk.com / admin123")
    print("User login:   vishnu@novhawk.com / password123")


if __name__ == "__main__":
    run()
