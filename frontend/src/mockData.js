// Static demo data — used automatically whenever the backend API is unreachable,
// so the UI can be previewed/developed without the FastAPI + Postgres stack running.

export const mockUser = {
  id: 'demo-user-1',
  name: 'R. Vishnu',
  email: 'vishnu@novhawk.com',
  role: 'user',
  title: 'Software Developer',
}

export const mockAdmin = {
  id: 'demo-admin-1',
  name: 'Admin User',
  email: 'admin@novhawk.com',
  role: 'admin',
  title: 'Administrator',
}

export const mockUserDashboard = {
  tasks_assigned: 12,
  tasks_due_today: 3,
  tasks_completed: 8,
  tasks_completed_this_week: 2,
  assessments_completed: 5,
  assessments_completed_this_week: 1,
  overall_progress: 78,
  my_tasks: [
    { id: 't1', title: 'Build responsive landing page', category: 'Web Development', status: 'assigned', due_date: new Date().toISOString(), assignee_id: 'demo-user-1', assignee_name: 'R. Vishnu', created_at: new Date().toISOString() },
    { id: 't2', title: 'Fix bugs in authentication', category: 'Bug Fixing', status: 'assigned', due_date: new Date(Date.now() + 86400000).toISOString(), assignee_id: 'demo-user-1', assignee_name: 'R. Vishnu', created_at: new Date().toISOString() },
    { id: 't3', title: 'Integrate payment gateway', category: 'Backend Development', status: 'assigned', due_date: new Date(Date.now() + 3 * 86400000).toISOString(), assignee_id: 'demo-user-1', assignee_name: 'R. Vishnu', created_at: new Date().toISOString() },
    { id: 't4', title: 'Prepare module documentation', category: 'Documentation', status: 'assigned', due_date: new Date(Date.now() + 4 * 86400000).toISOString(), assignee_id: 'demo-user-1', assignee_name: 'R. Vishnu', created_at: new Date().toISOString() },
  ],
  average_assessment_score: 75,
  assessment_breakdown: [
    { type: 'Technical', score: 80 },
    { type: 'Aptitude', score: 70 },
    { type: 'Coding', score: 60 },
    { type: 'Communication', score: 90 },
  ],
  upcoming_deadlines: [
    { id: 't1', title: 'Build responsive landing page', category: 'Web Development', status: 'assigned', due_date: new Date().toISOString(), assignee_id: 'demo-user-1', assignee_name: 'R. Vishnu', created_at: new Date().toISOString() },
    { id: 't2', title: 'Fix bugs in authentication', category: 'Bug Fixing', status: 'assigned', due_date: new Date(Date.now() + 86400000).toISOString(), assignee_id: 'demo-user-1', assignee_name: 'R. Vishnu', created_at: new Date().toISOString() },
    { id: 't5', title: 'Technical Assessment', category: 'Assessment', status: 'assigned', due_date: new Date(Date.now() + 2 * 86400000).toISOString(), assignee_id: 'demo-user-1', assignee_name: 'R. Vishnu', created_at: new Date().toISOString() },
  ],
}

export const mockAdminDashboard = {
  total_users: 156,
  total_users_this_week: 12,
  total_tasks: 42,
  total_tasks_this_week: 8,
  assessments_conducted: 28,
  assessments_conducted_this_week: 6,
  completion_rate: 68,
  task_overview: [
    { date: 'May 20', assigned: 22, completed: 8 },
    { date: 'May 21', assigned: 18, completed: 12 },
    { date: 'May 22', assigned: 40, completed: 20 },
    { date: 'May 23', assigned: 30, completed: 15 },
    { date: 'May 24', assigned: 35, completed: 18 },
    { date: 'May 25', assigned: 32, completed: 10 },
    { date: 'May 26', assigned: 38, completed: 22 },
  ],
  assessment_analytics: [
    { type: 'Technical', count: 12 },
    { type: 'Aptitude', count: 6 },
    { type: 'Coding', count: 5 },
    { type: 'Communication', count: 5 },
  ],
  top_performing_users: [
    { id: 'u1', name: 'R. Vishnu', title: 'Software Developer', progress: 92 },
    { id: 'u2', name: 'A. Karthik', title: 'QA Engineer', progress: 85 },
    { id: 'u3', name: 'S. Dharshini', title: 'Frontend Developer', progress: 78 },
    { id: 'u4', name: 'M. Praveen', title: 'Backend Developer', progress: 72 },
    { id: 'u5', name: 'K. Harini', title: 'Intern', progress: 68 },
  ],
  recent_activities: [
    { description: "New task 'API Integration' created", created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
    { description: "Assessment 'Coding Challenge' created", created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { description: "User 'R. Vishnu' completed Technical Assessment", created_at: new Date(Date.now() - 86400000).toISOString() },
    { description: "New user 'Karthik A' joined the platform", created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
}

export const mockTasks = [
  ...mockUserDashboard.my_tasks,
  { id: 't6', title: 'Set up CI pipeline', category: 'DevOps', status: 'completed', due_date: new Date(Date.now() - 2 * 86400000).toISOString(), assignee_id: 'demo-user-1', assignee_name: 'R. Vishnu', created_at: new Date().toISOString() },
  { id: 't7', title: 'Code review for API module', category: 'Backend Development', status: 'completed', due_date: new Date(Date.now() - 3 * 86400000).toISOString(), assignee_id: 'demo-user-1', assignee_name: 'R. Vishnu', created_at: new Date().toISOString() },
]

export const mockAssessments = [
  { id: 'a1', name: 'Technical Assessment', type: 'Technical', score: 80, user_id: 'demo-user-1', taken_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 'a2', name: 'Aptitude Test', type: 'Aptitude', score: 70, user_id: 'demo-user-1', taken_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'a3', name: 'Coding Challenge', type: 'Coding', score: 60, user_id: 'demo-user-1', taken_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'a4', name: 'Communication Test', type: 'Communication', score: 90, user_id: 'demo-user-1', taken_at: new Date(Date.now() - 1 * 86400000).toISOString() },
]

export const mockUsers = [
  { id: 'demo-admin-1', name: 'Admin User', email: 'admin@novhawk.com', role: 'admin', title: 'Administrator' },
  { id: 'u1', name: 'R. Vishnu', email: 'vishnu@novhawk.com', role: 'user', title: 'Software Developer' },
  { id: 'u2', name: 'A. Karthik', email: 'karthik@novhawk.com', role: 'user', title: 'QA Engineer' },
  { id: 'u3', name: 'S. Dharshini', email: 'dharshini@novhawk.com', role: 'user', title: 'Frontend Developer' },
  { id: 'u4', name: 'M. Praveen', email: 'praveen@novhawk.com', role: 'user', title: 'Backend Developer' },
  { id: 'u5', name: 'K. Harini', email: 'harini@novhawk.com', role: 'user', title: 'Intern' },
]

// Demo credentials accepted in offline/static mode (mirrors the seed script)
export const demoCredentials = [
  { email: 'admin@novhawk.com', password: 'admin123', user: mockAdmin },
  { email: 'vishnu@novhawk.com', password: 'password123', user: mockUser },
]
