import React, { useEffect, useState } from 'react'
import { CalendarCheck, CheckCircle2, FileCheck2, TrendingUp, Circle, CalendarDays } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import Topbar from '../components/Topbar'
import StatCard from '../components/StatCard'
import DonutChart from '../components/DonutChart'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { mockUserDashboard } from '../mockData'

function formatDueLabel(dueDateStr) {
  if (!dueDateStr) return 'No due date'
  const due = new Date(dueDateStr)
  const now = new Date()
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((startOfDay(due) - startOfDay(now)) / 86400000)

  if (diffDays === 0) return 'Due Today'
  if (diffDays === 1) return 'Due Tomorrow'
  if (diffDays > 1) return `Due in ${diffDays} Days`
  if (diffDays < 0) return 'Overdue'
  return due.toLocaleDateString()
}

export default function UserDashboard() {
  const { user, offline } = useAuth()
  const [data, setData] = useState(null)
  const [usingMock, setUsingMock] = useState(offline)

  useEffect(() => {
    if (offline) {
      setData(mockUserDashboard)
      return
    }
    client
      .get('/api/dashboard/user')
      .then((res) => setData(res.data))
      .catch((err) => {
        // Backend not reachable -> show static demo data instead of an error screen
        if (!err.response) {
          setUsingMock(true)
          setData(mockUserDashboard)
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

  const assessmentDonut = data.assessment_breakdown.map((b) => ({ name: b.type, value: b.score }))

  return (
    <DashboardLayout>
      <Topbar
        title={`Welcome back, ${user?.name || ''} 👋`}
        subtitle="Here's what's happening with your learning journey today."
      />

      {usingMock && (
        <div className="mb-5 px-4 py-2.5 rounded-xl bg-orange-50 text-accent-orange text-sm font-medium">
          Showing static demo data — backend isn't connected.
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard
          label="Tasks Assigned"
          value={data.tasks_assigned}
          footnote={data.tasks_due_today ? `↑ ${data.tasks_due_today} Due Today` : 'All caught up'}
          icon={CalendarDays}
          color="primary"
        />
        <StatCard
          label="Tasks Completed"
          value={data.tasks_completed}
          footnote={`+ ${data.tasks_completed_this_week} this week`}
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          label="Assessments Completed"
          value={data.assessments_completed}
          footnote={`+ ${data.assessments_completed_this_week} this week`}
          icon={FileCheck2}
          color="green"
        />
        <StatCard
          label="Overall Progress"
          value={`${data.overall_progress}%`}
          icon={TrendingUp}
          color="orange"
          progress={data.overall_progress}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink-900">My Tasks</h2>
            <button className="text-xs font-semibold text-primary-600">View All</button>
          </div>
          <div className="space-y-4">
            {data.my_tasks.length === 0 && (
              <p className="text-sm text-ink-500">No pending tasks. Nice work!</p>
            )}
            {data.my_tasks.map((t) => (
              <div key={t.id} className="flex items-start gap-3">
                <Circle size={16} className="text-ink-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{t.title}</p>
                  <p className="text-sm font-medium text-ink-900 truncate">{t.description}</p>
                  <p className="text-xs text-ink-500">{t.category}</p>
                </div>
                <span className="text-xs font-semibold text-primary-600 whitespace-nowrap">
                  {formatDueLabel(t.due_date)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink-900">Assessment Overview</h2>
            <button className="text-xs font-semibold text-primary-600">View All</button>
          </div>
          <DonutChart
            data={assessmentDonut.length ? assessmentDonut : [{ name: 'No data', value: 1 }]}
            centerLabel="Average Score"
            centerValue={`${data.average_assessment_score}%`}
          />
          <div className="space-y-2 mt-2">
            {data.assessment_breakdown.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{b.type}</span>
                <span className="font-semibold text-ink-900">{b.score}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink-900">Upcoming Deadlines</h2>
          </div>
          <div className="space-y-3">
            {data.upcoming_deadlines.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700">
                  <CalendarCheck size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{t.title}</p>
                  <p className="text-xs text-primary-600 font-medium">{formatDueLabel(t.due_date)}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm font-semibold text-primary-600 border border-primary-100 rounded-xl py-2 hover:bg-primary-50">
            View Calendar
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
