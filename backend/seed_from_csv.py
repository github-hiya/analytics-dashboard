import csv
from datetime import datetime
from database import SessionLocal, engine
import models

def seed_from_csv(csv_file='my_data.csv'):
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Clear existing data
    db.query(models.AgentRun).delete()
    db.commit()
    
    print(f"Loading data from {csv_file}...")
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0
        
        for row in reader:
            run = models.AgentRun(
                agent_id=int(row['agent_id']),
                user_id=int(row['user_id']),
                input_data=row['input_data'],
                output_data=row['output_data'],
                status=row['status'],
                created_at=row['created_at'],
                completed_at=row['completed_at'] if row['completed_at'] else None,
                feedback=int(row['feedback']) if row.get('feedback') else 0  # ← ADD THIS
            )
            db.add(run)
            count += 1
    
    db.commit()
    print(f"✓ Successfully loaded {count} runs from CSV!")
    db.close()

if __name__ == "__main__":
    seed_from_csv()