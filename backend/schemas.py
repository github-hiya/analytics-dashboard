from pydantic import BaseModel
from typing import Optional

class AgentRunBase(BaseModel):
    agent_id: int
    user_id: int
    input_data: str
    output_data: str
    status: str
    created_at: str
    completed_at: Optional[str] = None
    feedback: Optional[int] = 0  # ← ADD THIS LINE

class AgentRunCreate(AgentRunBase):
    pass

class AgentRun(AgentRunBase):
    id: int

    class Config:
        from_attributes = True

# Add new schema for feedback stats
class FeedbackStats(BaseModel):
    positive: int
    negative: int
    neutral: int


class KPIStats(BaseModel):
    total_runs: int
    completed: int
    failed: int
    avg_completion_time: float
    active_agents: int

class AgentStats(BaseModel):
    agent_id: int
    run_count: int
    avg_feedback: Optional[float] = 0  # Average feedback per agent

class StatusStats(BaseModel):
    status: str
    count: int

class TimelineStats(BaseModel):
    date: str
    count: int

# Optional: Feedback summary model if you want a separate endpoint
class FeedbackStats(BaseModel):
    agent_id: int
    positive: int
    negative: int
    neutral: int
    #avg_feedback: float  # between -1 and 1
