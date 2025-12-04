# Analytics Dashboard

A real-time analytics dashboard for monitoring agent performance and user feedback. Built with FastAPI backend and React frontend, featuring dynamic charts and statistics.

---

##  Features

### Visualization & Analytics
- **Real-time Dashboard** - Monitor agent performance with live data
- **5 Interactive Charts**:
  -  Bar Chart - Agent performance comparison (stacked)
  -  Pie Chart - Most called agents distribution
  -  Line Chart - Runs over time (last 15 days)
  -  Area Chart - 24-hour activity tracking
- **Top Agents Ranking** - Success rate leaderboard

### Key Metrics (KPIs)
- Total agent runs
- Completed vs failed runs
- Average completion time
- Active agent count

### Data Management
- CSV-based data seeding
- SQLite database for data persistence
- RESTful API endpoints
- Real-time data processing

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.8+ | Programming language |
| **FastAPI** | 0.104.1 | Web framework & REST API |
| **SQLAlchemy** | 2.0.23 | ORM & database management |
| **Pydantic** | 2.5.0 | Data validation |
| **SQLite** | 3.x | Database |
| **Uvicorn** | 0.24.0 | ASGI server |


### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **Vite** | 5.0.8 | Build tool & dev server |
| **React Query** | 5.12.0 | Data fetching & state management |
| **Recharts** | 2.10.0 | Chart library |
| **Tailwind CSS** | 3.3.6 | Styling framework |
| **Lucide React** | 0.263.1 | Icon library |

---





##  Dashboard Components

### Charts Overview

1. **24 Hour Activity (Area Chart)**
   - Shows hourly activity for current day
   - Purple gradient fill
   - Tracks total runs per hour

2. **Most Called Agents (Pie Chart)**
   - Distribution of runs across agents
   - Custom color scheme
   - Percentage labels

3. **Agent Performance (Stacked Bar Chart)**
   - Compares total, completed, and failed runs
   - Top 8 agents by activity
   - Color-coded by status



4. **Runs Over Time (Line Chart)**
   - Last 15 days of activity
   - Three lines: total, completed, failed
   - Smooth curve rendering

5. **Top Agents Ranking**
   - Success rate leaderboard
   - Top 5 agents
   - Ranked display with metrics

---







