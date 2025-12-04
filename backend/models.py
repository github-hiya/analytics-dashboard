from sqlalchemy import Column, Integer, String, Text
from database import Base

class AgentRun(Base):
    __tablename__ = "agent_run"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    agent_id = Column(Integer, index=True)
    user_id = Column(Integer, index=True)
    input_data = Column(Text)
    output_data = Column(Text)
    status = Column(String, index=True)
    created_at = Column(Text)
    completed_at = Column(Text, nullable=True)
    feedback = Column(Integer, nullable=True, default=0)  # ← ADD THIS LINE