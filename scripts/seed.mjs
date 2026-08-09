// Seeds a few realistic projects/tasks for a demo account, using the same anon-key + RLS path
// the app itself uses (not the service role key) — so it only ever writes what a signed-in user
// legitimately could.
//
// Usage:
//   1. Register the demo account through the app once (Sign up page). If your Supabase project
//      requires email confirmation, either confirm it via the link Supabase emails, or turn off
//      "Confirm email" under Authentication → Providers → Email for local/demo use.
//   2. node --env-file=.env.local scripts/seed.mjs
//
// Safe to re-run: it skips any demo project that already exists by name instead of duplicating it.

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

const { data: existing } = await supabase.from('projects').select('id, name').eq('created_by', demoId)
const existingNames = new Set((existing ?? []).map((p) => p.name))

const createdProjects = []
for (const p of projectsToCreate) {
  if (existingNames.has(p.name)) {
    const found = existing.find((e) => e.name === p.name)
    createdProjects.push({ ...p, id: found.id })
    console.log('Skipping (already exists):', p.name)
    continue
  }
  const { data, error } = await supabase.from('projects').insert({ ...p, created_by: demoId }).select().single()
  if (error) throw error
  createdProjects.push(data)
  await logActivity('PROJECT_CREATED', `Demo User created project "${data.name}"`, data.id)
  console.log('Created project:', data.name)
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

const { data: existingTasks } = await supabase.from('tasks').select('title, project_id').eq('created_by', demoId)
const existingTaskKey = new Set((existingTasks ?? []).map((t) => `${t.project_id}:${t.title}`))

let position = 1000
for (const t of tasksToCreate) {
  if (existingTaskKey.has(`${t.project.id}:${t.title}`)) {
    console.log('Skipping (already exists):', t.title)
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
      assigned_member_id: demoId,
      created_by: demoId,
    })
    .select()
    .single()
  if (error) throw error
  position += 1000
  await logActivity('TASK_CREATED', `Demo User created task "${data.title}" in ${t.project.name}`, t.project.id, data.id)
  console.log('Created task:', data.title)
}

console.log('Seed complete.')
