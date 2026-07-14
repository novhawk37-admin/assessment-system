import React, { useEffect, useState } from 'react'
import { Users, CalendarDays, FileCheck2, PieChart as PieIcon, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import Topbar from '../components/Topbar'
import StatCard from '../components/StatCard'
import DonutChart from '../components/DonutChart'
import TaskLineChart from '../components/TaskLineChart'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { mockAdminDashboard } from '../mockData'

function timeAgo(iso) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const hrs = Math.floor(diffMs / 3600000)
  if (hrs < 1) return 'just now'
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { offline } = useAuth()
  const [data, setData] = useState(null)
  const [usingMock, setUsingMock] = useState(offline)

  useEffect(() => {
    if (offline) {
      setData(mockAdminDashboard)
      return
    }
    client
      .get('/api/dashboard/admin')
      .then((res) => setData(res.data))
      .catch((err) => {
        if (!err.response) {
          setUsingMock(true)
          setData(mockAdminDashboard)
        }
      })
  }, [offline])

  if (!data) {
    return (
      <DashboardLayout>
        <p className="text-ink-500">Loading dashboard...</p>
      </DashboardLayout>
    )
  }

  const assessmentDonut = data.assessment_analytics.map((a) => ({ name: a.type, value: a.count }))
  const totalAssessments = data.assessment_analytics.reduce((sum, a) => sum + a.count, 0)

  return (
    <DashboardLayout>
      <Topbar
        title="Admin Dashboard"
        subtitle="Monitor tasks, assessments and overall platform performance."
      >
        <button
          onClick={() => navigate('/admin/tasks/new')}
          className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl"
        >
          <Plus size={18} />
          Add New Task
        </button>
      </Topbar>

      {usingMock && (
        <div className="mb-5 px-4 py-2.5 rounded-xl bg-orange-50 text-accent-orange text-sm font-medium">
          Showing static demo data — backend isn't connected.
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={data.total_users}
          footnote={`+ ${data.total_users_this_week} this week`}
          icon={Users}
          color="primary"
        />
        <StatCard
          label="Total Tasks"
          value={data.total_tasks}
          footnote={`+ ${data.total_tasks_this_week} this week`}
          icon={CalendarDays}
          color="blue"
        />
        <StatCard
          label="Assessments Conducted"
          value={data.assessments_conducted}
          footnote={`+ ${data.assessments_conducted_this_week} this week`}
          icon={FileCheck2}
          color="green"
        />
        <StatCard
          label="Completion Rate"
          value={`${data.completion_rate}%`}
          footnote={`+ ${data.completion_rate}% this week`}
          icon={PieIcon}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-ink-900">Task Overview</h2>
            <div className="flex items-center gap-3 text-xs text-ink-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Assigned</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-blue inline-block" /> Completed</span>
            </div>
          </div>
          <TaskLineChart data={data.task_overview} />
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-bold text-ink-900 mb-4">Assessment Analytics</h2>
          <DonutChart
            data={assessmentDonut.length ? assessmentDonut : [{ name: 'No data', value: 1 }]}
            centerLabel="Total"
            centerValue={totalAssessments}
          />
          <div className="space-y-2 mt-3">
            {data.assessment_analytics.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{a.type}</span>
                <span className="font-semibold text-ink-900">
                  {a.count} ({totalAssessments ? Math.round((a.count / totalAssessments) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink-900">Top Performing Users</h2>
            <button className="text-xs font-semibold text-primary-600">View All</button>
          </div>
          <div className="space-y-4">
            {data.top_performing_users.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-ink-500 w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                  {u.name?.[0]}
                </div>
                <p className="text-sm font-medium text-ink-900 flex-1 truncate">{u.name}</p>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${u.progress}%` }} />
                </div>
                <span className="text-sm font-semibold text-ink-900 w-10 text-right">{u.progress}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink-900">Recent Activities</h2>
            <button className="text-xs font-semibold text-primary-600">View All</button>
          </div>
          <div className="space-y-4">
            {data.recent_activities.map((a, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <p className="text-sm text-ink-700">{a.description}</p>
                <span className="text-xs text-ink-500 whitespace-nowrap">{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
