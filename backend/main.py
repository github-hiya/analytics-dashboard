from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from dateutil import parser
import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agent Analytics API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Agent Analytics API"}

@app.get("/runs", response_model=List[schemas.AgentRun])
def get_all_runs(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    runs = db.query(models.AgentRun).offset(skip).limit(limit).all()
    return runs

@app.get("/runs/stats", response_model=schemas.KPIStats)
def get_stats(db: Session = Depends(get_db)):
    total_runs = db.query(models.AgentRun).count()
    completed_count = db.query(models.AgentRun).filter(models.AgentRun.status == "completed").count()  # ← Changed variable name
    failed = db.query(models.AgentRun).filter(models.AgentRun.status == "failed").count()
    
    # Calculate average completion time
    completed_runs = db.query(models.AgentRun).filter(
        models.AgentRun.status == "completed",
        models.AgentRun.completed_at.isnot(None)
    ).all()
    
    total_time = 0
    valid_runs = 0
    for run in completed_runs:
        try:
            created = parser.parse(run.created_at)
            completed_time = parser.parse(run.completed_at)  # ← Changed variable name
            diff = (completed_time - created).total_seconds()
            if diff >= 0:
                total_time += diff
                valid_runs += 1
        except:
            continue
    
    avg_completion_time = total_time / valid_runs if valid_runs > 0 else 0
    
    # Count active agents
    active_agents = db.query(func.count(func.distinct(models.AgentRun.agent_id))).scalar()
    
    return schemas.KPIStats(
        total_runs=total_runs,
        completed=completed_count,  # ← Use the renamed variable
        failed=failed,
        avg_completion_time=round(avg_completion_time, 2),
        active_agents=active_agents
    )

@app.get("/runs/agents", response_model=List[schemas.AgentStats])
def get_agent_stats(db: Session = Depends(get_db)):
    results = db.query(
        models.AgentRun.agent_id,
        func.count(models.AgentRun.id).label('run_count')
    ).group_by(models.AgentRun.agent_id).all()
    
    return [schemas.AgentStats(agent_id=r.agent_id, run_count=r.run_count) for r in results]

@app.get("/runs/status", response_model=List[schemas.StatusStats])
def get_status_stats(db: Session = Depends(get_db)):
    results = db.query(
        models.AgentRun.status,
        func.count(models.AgentRun.id).label('count')
    ).group_by(models.AgentRun.status).all()
    
    return [schemas.StatusStats(status=r.status, count=r.count) for r in results]

@app.get("/runs/timeline", response_model=List[schemas.TimelineStats])
def get_timeline_stats(db: Session = Depends(get_db)):
    runs = db.query(models.AgentRun).all()
    
    date_counts = {}
    for run in runs:
        try:
            date = parser.parse(run.created_at).date().isoformat()
            date_counts[date] = date_counts.get(date, 0) + 1
        except:
            continue
    
    results = [schemas.TimelineStats(date=date, count=count) for date, count in sorted(date_counts.items())]
    return results

@app.post("/runs", response_model=schemas.AgentRun)
def create_run(run: schemas.AgentRunCreate, db: Session = Depends(get_db)):
    db_run = models.AgentRun(**run.dict())
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    return db_run

@app.get("/runs/agents/{agent_id}/stats")
def get_agent_detailed_stats(agent_id: int, db: Session = Depends(get_db)):
    total = db.query(models.AgentRun).filter(models.AgentRun.agent_id == agent_id).count()
    completed = db.query(models.AgentRun).filter(
        models.AgentRun.agent_id == agent_id,
        models.AgentRun.status == "completed"
    ).count()
    failed = db.query(models.AgentRun).filter(
        models.AgentRun.agent_id == agent_id,
        models.AgentRun.status == "failed"
    ).count()
    
    # Average completion time for this agent
    completed_runs = db.query(models.AgentRun).filter(
        models.AgentRun.agent_id == agent_id,
        models.AgentRun.status == "completed",
        models.AgentRun.completed_at.isnot(None)
    ).all()
    
    total_time = 0
    valid_runs = 0
    for run in completed_runs:
        try:
            created = parser.parse(run.created_at)
            comp = parser.parse(run.completed_at)
            diff = (comp - created).total_seconds()
            if diff >= 0:
                total_time += diff
                valid_runs += 1
        except:
            continue
    
    avg_time = total_time / valid_runs if valid_runs > 0 else 0
    
    return {
        "agent_id": agent_id,
        "total_runs": total,
        "completed": completed,
        "failed": failed,
        "avg_completion_time": round(avg_time, 2)
    }
    # Add this new endpoint after your other endpoints

@app.get("/runs/feedback", response_model=schemas.FeedbackStats)
def get_feedback_stats(db: Session = Depends(get_db)):
    positive = db.query(models.AgentRun).filter(models.AgentRun.feedback == 1).count()
    negative = db.query(models.AgentRun).filter(models.AgentRun.feedback == -1).count()
    neutral = db.query(models.AgentRun).filter(
        (models.AgentRun.feedback == 0) | (models.AgentRun.feedback.is_(None))
    ).count()
    
    return schemas.FeedbackStats(
        positive=positive,
        negative=negative,
        neutral=neutral
    )