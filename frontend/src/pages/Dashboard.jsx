import { useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle, XCircle, Clock, Users, TrendingUp, BarChart3, ThumbsUp, ThumbsDown } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const API_URL = 'http://localhost:8000';

// Fetch all data in one hook
const useDashboardData = () => {
  const runs = useQuery({
    queryKey: ['runs'],
    queryFn: () => fetch(`${API_URL}/runs`).then(r => r.json()),
    staleTime: 0,  
    cacheTime: 0,
    refetchOnMount: false
  });

  const stats = useQuery({
    queryKey: ['stats'],
    queryFn: () => fetch(`${API_URL}/runs/stats`).then(r => r.json()),
    refetchOnMount: false
  });

  const agents = useQuery({
    queryKey: ['agents'],
    queryFn: () => fetch(`${API_URL}/runs/agents`).then(r => r.json()),
    refetchOnMount: false
  });

  const status = useQuery({
    queryKey: ['status'],
    queryFn: () => fetch(`${API_URL}/runs/status`).then(r => r.json()),
    refetchOnMount: false
  });

  const timeline = useQuery({
    queryKey: ['timeline'],
    queryFn: () => fetch(`${API_URL}/runs/timeline`).then(r => r.json()),
    refetchOnMount: false
  });

  // ADD THIS - Fetch feedback data
  const feedback = useQuery({
    queryKey: ['feedback'],
    queryFn: () => fetch(`${API_URL}/runs/feedback`).then(r => r.json()),
    refetchOnMount: false
  });

  const isLoading = runs.isLoading || stats.isLoading || agents.isLoading || status.isLoading || timeline.isLoading || feedback.isLoading;

  return { 
    runs: runs.data || [], 
    stats: stats.data || {}, 
    agents: agents.data || [], 
    status: status.data || [], 
    timeline: timeline.data || [], 
    feedback: feedback.data || { positive: 0, negative: 0, neutral: 0 },  // ← ADD THIS
    isLoading 
  };
};

// Chart Container
const ChartCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <Icon className="w-5 h-5 text-gray-400" />
    </div>
    {children}
  </div>
);

function Dashboard() {
  const { runs, stats, agents, status, timeline, feedback, isLoading } = useDashboardData();  // ← ADD feedback

  // ... all your existing data processing code ...

  const agentData = agents.map(a => ({
    name: `Agent ${a.agent_id}`,
    runs: a.run_count,
    completed: runs.filter(r => r.agent_id === a.agent_id && r.status === 'completed').length,
    failed: runs.filter(r => r.agent_id === a.agent_id && r.status === 'failed').length,
  })).sort((a, b) => b.runs - a.runs).slice(0, 8);

  const statusData = status.map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    color: { completed: '#ff7d00', failed: '#15616d', running: '#001524', queued: '#78290f' }[s.status]
  }));

  const timelineData = timeline.slice(-15).map(t => {
    const dayRuns = runs.filter(r => new Date(r.created_at).toDateString() === new Date(t.date).toDateString());
    return {
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: t.count,
      completed: dayRuns.filter(r => r.status === 'completed').length,
      failed: dayRuns.filter(r => r.status === 'failed').length
    };
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hourStart = new Date(today);
    hourStart.setHours(i, 0, 0, 0);

    const hourEnd = new Date(today);
    hourEnd.setHours(i + 1, 0, 0, 0);

    const runsInHour = runs.filter(r => {
      const created = new Date(r.created_at);
      return created >= hourStart && created < hourEnd;
    });

    return {
      time: `${i}:00`,
      runs: runsInHour.length,
      success: runsInHour.filter(r => r.status === "completed").length
    };
  });

  const topAgents = agentData.slice(0, 5).map((a, i) => ({
    ...a,
    rank: i + 1,
    successRate: a.runs > 0 ? ((a.completed / a.runs) * 100).toFixed(1) : 0
  }));

  const successRate = stats.total_runs > 0 ? ((stats.completed / stats.total_runs) * 100).toFixed(1) : 0;

  const agentPieData = agents.map(a => ({
    name: `Agent ${a.agent_id}`,
    value: a.run_count,
    color: ['#ff7d00', '#15616d', '#001524', '#78290f', '#4a7c59', '#8d6cab'][a.agent_id % 6]
  }));

  // ADD THIS - Prepare diverging bar chart data
  const feedbackData = [
    {
      category: 'Feedback',
      positive: feedback.positive,
      negative: -feedback.negative,  // Negative value for left side
      neutral: feedback.neutral
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="24 Hour Activity" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} interval={2} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="runs" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Total Runs" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Most Called Agents" icon={Users}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agentPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {agentPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="mb-6">
          <ChartCard title="Agent Performance Comparison" icon={BarChart3}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={agentData} barSize={80}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="runs" fill="#598cb1" name="Total Runs" stackId="stack" />
                <Bar dataKey="completed" fill="#929bc6" name="Completed" stackId="stack" />
                <Bar dataKey="failed" fill="#cba9db" name="Failed" stackId="stack" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Runs Over Time" icon={BarChart3}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#ab4b91" strokeWidth={3} />
                <Line type="monotone" dataKey="completed" stroke="#41efaa" strokeWidth={2} />
                <Line type="monotone" dataKey="failed" stroke="#466eb4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Agents by Success Rate" icon={TrendingUp}>
            <div className="space-y-4">
              {topAgents.map((agent) => (
                <div key={agent.rank} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-black font-bold">
                      {agent.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{agent.name}</div>
                      <div className="text-sm text-gray-500">{agent.runs} total runs</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{agent.successRate}%</div>
                    <div className="text-xs text-gray-500">{agent.completed} completed</div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
        
      </div>
    </div>
  );
}

export default Dashboard;
