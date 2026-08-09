// Seeds a few realistic projects/tasks for a demo workspace, using the same anon-key + RLS path
// the app itself uses (not the service role key) — so it only ever writes what a signed-in user
// legitimately could. Tasks and project membership are distributed round-robin across every
// profile that exists in the workspace, so assignment is visible on more than one avatar.
//
// Usage:
//   1. Register the demo account through the app once (Sign up page) — and optionally a second
//      account to see assignment across teammates. If your Supabase project requires email
//      confirmation, either confirm it via the link Supabase emails, or turn off "Confirm email"
//      under Authentication → Providers → Email for local/demo use.
//   2. node --env-file=.env.local scripts/seed.mjs
//
// Safe to re-run: skips any project/task that already exists by name, and re-applies
// assignment/project-membership to existing rows too (so running it again after a new teammate
// registers redistributes assignments to include them).

// Node < 22 has no native WebSocket global, which @supabase/supabase-js's realtime client
// expects to exist even though this script never opens a realtime subscription.
if (!globalThis.WebSocket) {
  const { default: WebSocket } = await import('ws')
  globalThis.WebSocket = WebSocket
}

import { createClient } from '@supabase/supabase-js'

const DEMO_EMAIL = process.env.SEED_DEMO_EMAIL || 'demo@teamflow.app'
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'TeamFlowDemo123!'

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Run with: node --env-file=.env.local scripts/seed.mjs')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
})
if (authError) {
  console.error(`Could not sign in as ${DEMO_EMAIL}: ${authError.message}`)
  console.error('Register this account through the app first (confirm its email if your project requires it), then re-run this script.')
  process.exit(1)
}
const demoId = authData.user.id
console.log(`Signed in as ${DEMO_EMAIL} (${demoId})`)

const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, name').order('created_at')
if (profilesError) throw profilesError
console.log(`Found ${profiles.length} team member(s): ${profiles.map((p) => p.name).join(', ')}`)

async function logActivity(type, message, projectId, taskId) {
  await supabase.from('activity').insert({ type, actor_id: demoId, project_id: projectId ?? null, task_id: taskId ?? null, message })
}

const today = new Date()
function daysFromNow(n) {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const projectsToCreate = [
  { name: 'Mobile App Redesign', description: 'Revamp the TeamFlow mobile experience with a cleaner navigation model and dark mode.', status: 'ACTIVE', priority: 'HIGH', start_date: daysFromNow(-20), due_date: daysFromNow(18) },
  { name: 'API v2 Migration', description: 'Migrate all internal services from the legacy REST API to the new versioned endpoints.', status: 'PLANNING', priority: 'CRITICAL', start_date: daysFromNow(-2), due_date: daysFromNow(45) },
  { name: 'Marketing Website Refresh', description: 'New landing page, pricing page, and blog template.', status: 'ON_HOLD', priority: 'LOW', start_date: daysFromNow(-40), due_date: daysFromNow(-5) },
  { name: 'Q3 Customer Onboarding', description: 'Streamline the first-week experience for new customers.', status: 'COMPLETED', priority: 'MEDIUM', start_date: daysFromNow(-60), due_date: daysFromNow(-10) },
]

const { data: existingProjects } = await supabase.from('projects').select('id, name').eq('created_by', demoId)
const existingProjectNames = new Set((existingProjects ?? []).map((p) => p.name))

const createdProjects = []
for (const p of projectsToCreate) {
  if (existingProjectNames.has(p.name)) {
    const found = existingProjects.find((e) => e.name === p.name)
    createdProjects.push({ ...p, id: found.id })
    console.log('Project already exists, reusing:', p.name)
    continue
  }
  const { data, error } = await supabase.from('projects').insert({ ...p, created_by: demoId }).select().single()
  if (error) throw error
  createdProjects.push(data)
  await logActivity('PROJECT_CREATED', `Demo User created project "${data.name}"`, data.id)
  console.log('Created project:', data.name)
}

// Every profile in the workspace joins every seeded project, so "Team" shows more than one
// avatar on the project cards/detail page instead of "Unassigned".
for (const project of createdProjects) {
  const { data: existingMembers } = await supabase.from('project_members').select('member_id').eq('project_id', project.id)
  const existingMemberIds = new Set((existingMembers ?? []).map((m) => m.member_id))
  const missing = profiles.filter((p) => !existingMemberIds.has(p.id))
  if (missing.length > 0) {
    const { error } = await supabase.from('project_members').insert(missing.map((p) => ({ project_id: project.id, member_id: p.id })))
    if (error) throw error
    console.log(`Added ${missing.map((p) => p.name).join(', ')} to "${project.name}"`)
  }
}

const [mobileApp, apiMigration, , onboarding] = createdProjects

const tasksToCreate = [
  { project: mobileApp, title: 'Audit current navigation patterns', status: 'COMPLETED', priority: 'MEDIUM', due_date: daysFromNow(-10), tags: ['research'] },
  { project: mobileApp, title: 'Design new tab bar', status: 'REVIEW', priority: 'HIGH', due_date: daysFromNow(3), tags: ['design'] },
  { project: mobileApp, title: 'Implement dark mode tokens', status: 'IN_PROGRESS', priority: 'HIGH', due_date: daysFromNow(7), tags: ['frontend'] },
  { project: mobileApp, title: 'QA pass on iOS', status: 'TODO', priority: 'MEDIUM', due_date: daysFromNow(14), tags: ['qa'] },
  { project: mobileApp, title: 'QA pass on Android', status: 'TODO', priority: 'MEDIUM', due_date: daysFromNow(15), tags: ['qa'] },
  { project: apiMigration, title: 'Write migration plan doc', status: 'IN_PROGRESS', priority: 'CRITICAL', due_date: daysFromNow(5), tags: ['docs'] },
  { project: apiMigration, title: 'Stand up v2 staging environment', status: 'TODO', priority: 'HIGH', due_date: daysFromNow(12), tags: ['infra'] },
  { project: apiMigration, title: 'Update client SDKs', status: 'TODO', priority: 'MEDIUM', due_date: daysFromNow(30), tags: ['sdk'] },
  { project: onboarding, title: 'Ship welcome email sequence', status: 'COMPLETED', priority: 'MEDIUM', due_date: daysFromNow(-15), tags: ['lifecycle'] },
  { project: onboarding, title: 'Add product tour', status: 'COMPLETED', priority: 'LOW', due_date: daysFromNow(-12), tags: ['onboarding'] },
]

const { data: existingTasks } = await supabase.from('tasks').select('id, title, project_id, assigned_member_id').eq('created_by', demoId)
const existingTaskByKey = new Map((existingTasks ?? []).map((t) => [`${t.project_id}:${t.title}`, t]))

let position = 1000
let assignIndex = 0
function nextAssignee() {
  const p = profiles[assignIndex % profiles.length]
  assignIndex += 1
  return p
}

for (const t of tasksToCreate) {
  const key = `${t.project.id}:${t.title}`
  const existingTask = existingTaskByKey.get(key)
  const assignee = nextAssignee()

  if (existingTask) {
    if (existingTask.assigned_member_id !== assignee.id) {
      const { error } = await supabase.from('tasks').update({ assigned_member_id: assignee.id }).eq('id', existingTask.id)
      if (error) throw error
      await logActivity('TASK_ASSIGNED', `Demo User assigned task "${t.title}" to ${assignee.name}`, t.project.id, existingTask.id)
      console.log(`Reassigned "${t.title}" to ${assignee.name}`)
    } else {
      console.log('Task already exists and correctly assigned:', t.title)
    }
    continue
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: t.project.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_date: t.due_date,
      tags: t.tags,
      position,
      assigned_member_id: assignee.id,
      created_by: demoId,
    })
    .select()
    .single()
  if (error) throw error
  position += 1000
  await logActivity('TASK_CREATED', `Demo User created task "${data.title}" in ${t.project.name}`, t.project.id, data.id)
  await logActivity('TASK_ASSIGNED', `Demo User assigned task "${data.title}" to ${assignee.name}`, t.project.id, data.id)
  console.log(`Created task "${data.title}", assigned to ${assignee.name}`)
}

console.log('Seed complete.')
