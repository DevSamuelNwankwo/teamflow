# TeamFlow — Claude Code Development Guide

## 1. Project Identity

**Project:** TeamFlow
**Type:** Collaborative Project & Task Management SaaS
**Primary Users:** Small software-development teams
**Goal:** Build a polished, production-quality project and task management application with authentication, projects, Kanban task management, team management, activity tracking, analytics, responsive design, and persistent data.

TeamFlow should feel like a real SaaS product, not a coding-assessment prototype.

Reference products such as Linear, Jira, Trello, and Asana may be studied for workflow ideas and UX conventions, but **do not clone their interfaces, layouts, branding, or visual identity**.

---

# 2. Core Development Principles

Claude must follow these principles throughout development:

### 2.1 Build the product, not a demo

Every feature should be implemented as a functional part of the application.

Do not create fake buttons, placeholder interactions, disconnected UI cards, or hard-coded dashboard statistics unless explicitly required for an empty/demo state.

If a user creates a project, the project must actually exist in application state/database and appear everywhere it should.

If a task moves from `TODO` to `IN_PROGRESS`, the underlying task data must update.

If data is deleted, related UI must update accordingly.

---

### 2.2 Prefer simple architecture

Use the simplest architecture that satisfies the requirements.

Do NOT:

* Over-engineer the application
* Introduce unnecessary microservices
* Create excessive abstraction layers
* Create generic abstractions before there is a real need
* Add libraries merely because they are popular
* Create enterprise-level infrastructure for a small SaaS assessment

Do:

* Keep responsibilities clear
* Create reusable components
* Keep domain logic organized
* Keep API/data-access logic separate from UI
* Use predictable state management
* Favor readable code over clever code

---

### 2.3 TypeScript first

Use TypeScript throughout the application.

Avoid `any` unless there is a compelling technical reason.

Prefer:

```ts
interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  dueDate: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

Use union types/enums for constrained values:

```ts
type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED";
```

Keep frontend and backend data contracts consistent.

---

# 3. Required Technology Stack

## Frontend

Mandatory:

* React
* Vite
* TypeScript
* Tailwind CSS

Recommended supporting technologies may include:

* React Router
* TanStack Query
* React Hook Form
* Zod
* Recharts
* Lucide React
* dnd-kit

These are recommendations, not mandatory requirements.

Only introduce a dependency when it provides meaningful value.

---

## Backend

Use:

* Node.js
* Express

A suitable alternative may be used if there is a strong reason.

---

## Database

Use a persistent database.

Preferred options:

* PostgreSQL
* Supabase

Other reasonable options are acceptable if they provide reliable persistence.

Do not use browser-only state as the primary data store for the final application.

---

# 4. Architecture

Use a clear separation between:

```text
UI
↓
Application / State
↓
API / Data Access
↓
Backend
↓
Database
```

Suggested frontend structure:

```text
src/
├── assets/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── projects/
│   ├── tasks/
│   ├── team/
│   └── activity/
├── pages/
├── hooks/
├── services/
├── lib/
├── types/
├── utils/
├── constants/
├── contexts/
├── routes/
├── App.tsx
└── main.tsx
```

Suggested backend structure:

```text
server/
├── controllers/
├── routes/
├── services/
├── middleware/
├── models/
├── db/
├── utils/
├── types/
└── server.ts
```

The exact folder structure can change when justified.

Do not create folders that contain only one meaningless file simply to satisfy a theoretical architecture.

---

# 5. Domain Model

The primary domain entities are:

```text
User
TeamMember
Project
Task
Activity
```

Relationships should be explicit.

### User

```text
id
name
email
passwordHash
avatar
createdAt
updatedAt
```

### Team Member

```text
id
name
email
avatar
role
status
createdAt
updatedAt
```

### Project

```text
id
name
description
status
priority
startDate
dueDate
createdAt
updatedAt
```

Projects should support relationships with team members and tasks.

### Task

```text
id
projectId
title
description
status
priority
assignedMemberId
dueDate
createdAt
updatedAt
tags
```

### Activity

```text
id
type
actorId
projectId
taskId
message
createdAt
metadata
```

The implementation may differ if another design provides cleaner relational integrity.

---

# 6. Required Project Statuses

Projects must support:

```text
PLANNING
ACTIVE
ON_HOLD
COMPLETED
```

Display labels should be human-readable:

```text
Planning
Active
On Hold
Completed
```

Do not scatter these values throughout components.

Centralize domain constants where appropriate.

---

# 7. Required Priority Levels

Tasks and projects should support:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Use consistent visual treatment throughout the application.

Do not hard-code priority styling separately in every component.

Create reusable components such as:

```tsx
<PriorityBadge priority={task.priority} />
```

---

# 8. Authentication

Authentication must include:

* Register
* Login
* Logout
* Protected routes
* Session persistence
* Authentication state
* Form validation
* Error feedback

Never hard-code:

* Passwords
* API keys
* Database credentials
* Secret tokens
* Private environment variables

Use environment variables.

Example:

```env
DATABASE_URL=
JWT_SECRET=
VITE_API_URL=
```

Never commit real credentials.

---

# 9. Protected Application Structure

Unauthenticated users should not be able to access authenticated application pages.

Suggested routes:

```text
/login
/register

/app
/app/dashboard
/app/projects
/app/projects/:projectId
/app/tasks
/app/team
/app/activity
```

The exact routing structure can differ, but navigation should remain intuitive.

---

# 10. Dashboard

The dashboard must communicate useful information immediately.

Required information:

### Projects

* Total projects
* Active projects
* Completed projects

### Tasks

* Total tasks
* Completed tasks
* Pending tasks

### People

* Team member count

### Deadlines

* Upcoming deadlines

### Activity

* Recent activity

### Analytics

At least one meaningful visualization.

Possible examples:

* Tasks by status
* Tasks by priority
* Completion trend
* Weekly productivity
* Project status distribution

Avoid decorative charts that do not communicate useful information.

---

# 11. Dashboard Data Integrity

Dashboard metrics must be derived from actual application data.

For example:

```text
Total Projects
= count(projects)

Active Projects
= projects.filter(status === ACTIVE)

Completed Tasks
= tasks.filter(status === COMPLETED)
```

Do not manually hard-code:

```text
24 projects
72 tasks
18 completed
```

unless the application is explicitly operating in a seeded demo state.

---

# 12. Project Management

Implement full CRUD:

```text
Create
Read
Update
Delete
```

Required project information:

* Name
* Description
* Status
* Priority
* Start date
* Due date
* Team members

---

## Project List

The project list should provide:

* Clear project name
* Status
* Priority
* Deadline
* Progress/task summary
* Assigned members
* Search/filter capability where appropriate

Provide a useful empty state.

Example:

```text
No projects yet

Create your first project to start organizing your team's work.

[Create Project]
```

---

## Project Details

Project detail pages should provide:

* Project overview
* Status
* Priority
* Dates
* Assigned members
* Task progress
* Kanban board
* Activity

---

# 13. Project Forms

Project creation and editing should use reusable forms.

Requirements:

* Validation
* Required fields
* Date validation
* Clear error messages
* Loading state
* Success feedback
* Server error handling

Avoid duplicating create/edit forms.

Prefer:

```tsx
<ProjectForm mode="create" />
<ProjectForm mode="edit" project={project} />
```

---

# 14. Destructive Actions

Deleting projects, tasks, or team members must require confirmation.

Do not immediately delete important data after a single accidental click.

Example:

```text
Delete project?

This action cannot be undone.

[Cancel] [Delete Project]
```

---

# 15. Kanban Board

Every project must have a Kanban board.

Required columns:

```text
TODO
IN_PROGRESS
REVIEW
COMPLETED
```

Display labels:

```text
To Do
In Progress
Review
Completed
```

Tasks must be movable between columns using drag and drop.

---

# 16. Kanban Requirements

Dragging a task must:

1. Update the visual position.
2. Update the task status.
3. Persist the new status.
4. Generate activity where appropriate.
5. Handle API failure gracefully.

Do not allow the UI to permanently display a task in the wrong status after a failed update.

Use optimistic updates only when rollback behavior is properly implemented.

---

# 17. Task CRUD

Tasks must support:

* Create
* View
* Edit
* Delete
* Assign member
* Change priority
* Change status
* Set due date
* Add tags

Task information:

```text
Title
Description
Status
Priority
Assigned Member
Creation Date
Due Date
Tags
```

---

# 18. Task Component Strategy

Build reusable task components.

Potential components:

```text
TaskCard
TaskModal
TaskForm
TaskDetails
TaskPriority
TaskAssignee
TaskTags
KanbanColumn
KanbanBoard
```

Do not create separate nearly-identical components for each Kanban column.

For example, avoid:

```text
TodoTaskCard
ReviewTaskCard
CompletedTaskCard
```

Instead:

```tsx
<TaskCard task={task} />
```

---

# 19. Search, Filter & Sort

Search must work across relevant project/task data.

Filters should support:

* Status
* Priority
* Assigned member

Sorting may support:

* Due date
* Creation date
* Priority
* Name

Filters should be composable.

Example:

```text
Search: website

Status: In Progress

Priority: High

Assignee: John
```

The resulting list should satisfy all selected conditions.

Provide a clear no-results state.

---

# 20. Team Members

Create a Team Members section.

Each member may have:

```text
Name
Avatar
Email
Role
Status
Assigned Projects
Assigned Tasks
```

Tasks must be assignable to members.

Assignments must appear in:

* Task cards
* Task details
* Project details
* Team member views
* Dashboard where relevant

---

# 21. Activity System

Activity should reflect meaningful application state changes.

Examples:

```text
John created project Website Redesign

Sarah created task Build homepage

John assigned Sarah to Build homepage

Sarah moved Build homepage to Review

Sarah completed Build homepage

John completed project Website Redesign
```

Activity does not need to be a real-time enterprise event stream.

However, activity must be generated from actual actions rather than being permanently hard-coded.

---

# 22. UI Design System

The interface should have a cohesive visual language.

Define reusable design tokens for:

* Colors
* Spacing
* Typography
* Border radius
* Shadows
* Component states

Tailwind should be used consistently.

Avoid excessive arbitrary values such as:

```text
mt-[17px]
px-[13px]
rounded-[11px]
```

unless there is a legitimate design reason.

Prefer the project's established spacing system.

---

# 23. Layout

The primary application shell should generally contain:

```text
Sidebar
+
Main Content
```

Desktop:

```text
┌──────────────┬───────────────────────────────┐
│              │ Header                        │
│   Sidebar    ├───────────────────────────────┤
│              │                               │
│              │ Main Content                  │
│              │                               │
└──────────────┴───────────────────────────────┘
```

Mobile navigation should collapse appropriately.

Do not simply shrink the desktop sidebar onto mobile.

---

# 24. Responsive Design

Target:

```text
Mobile: 375px
Tablet: 768px
Desktop: 1440px
```

The application must:

* Avoid horizontal overflow
* Maintain readable typography
* Adapt navigation
* Adapt forms
* Adapt cards
* Adapt tables
* Adapt Kanban behavior
* Keep important actions accessible

For Kanban on small screens, horizontal scrolling is acceptable when necessary, provided it is intentional and usable.

---

# 25. Light & Dark Theme

Implement:

```text
Light
Dark
```

Theme preference must persist after refresh.

All components must support both themes.

Do not fix dark mode only for the dashboard while leaving modals, forms, Kanban cards, dropdowns, or empty states unreadable.

Check:

* Backgrounds
* Text
* Borders
* Inputs
* Buttons
* Cards
* Modals
* Charts
* Badges
* Hover states
* Focus states

---

# 26. Loading States

Every asynchronous feature should have an appropriate loading state.

Examples:

```text
Loading projects...
Loading tasks...
Saving project...
Deleting task...
Signing in...
```

Prefer skeletons for major content areas when appropriate.

Avoid blank screens while data is loading.

---

# 27. Error States

Errors should be visible and understandable.

Handle:

* Network failure
* Authentication failure
* Validation failure
* Unauthorized access
* Missing project
* Missing task
* Failed create/update/delete
* Server errors

Do not silently swallow errors.

Bad:

```ts
try {
  await createProject(data);
} catch {}
```

Better:

```ts
try {
  await createProject(data);
} catch (error) {
  showError(getReadableError(error));
}
```

---

# 28. Empty States

Empty states should explain what happened and what the user can do next.

Examples:

```text
No projects found

Try adjusting your filters or create a new project.
```

```text
No tasks in this column

Drag a task here or create a new task.
```

Avoid empty pages with no explanation.

---

# 29. Notifications

Use toast/notification feedback for important actions.

Examples:

```text
Project created successfully.

Task updated successfully.

Task moved to Review.

Project deleted.

Unable to save changes.
```

Do not display notifications for every trivial UI interaction.

---

# 30. Accessibility

Use semantic HTML.

Requirements:

* Labels for inputs
* Accessible buttons
* Keyboard navigation
* Visible focus states
* Proper dialog semantics
* Accessible dropdowns
* Appropriate ARIA attributes
* Meaningful alt text
* Sufficient color contrast

Never use color alone to communicate status.

For example:

```text
● High
● Medium
● Low
```

should still have text labels.

---

# 31. Performance

Prioritize practical performance.

Do:

* Efficient list rendering
* Reasonable API requests
* Lazy-load large routes where useful
* Optimize images
* Avoid unnecessary state updates
* Use memoization only when it provides measurable/meaningful value

Do not:

* Prematurely optimize everything
* Add complex caching systems without need
* Introduce unnecessary abstraction for performance
* Optimize code at the expense of readability

---

# 32. API Architecture

Keep API calls out of presentation components where possible.

Prefer:

```text
components
    ↓
hooks
    ↓
services
    ↓
API
```

Example:

```ts
projectService.getProjects()
projectService.createProject(data)
projectService.updateProject(id, data)
projectService.deleteProject(id)
```

Rather than scattering:

```ts
fetch(...)
fetch(...)
axios(...)
fetch(...)
```

throughout components.

---

# 33. API Error Handling

API services should normalize errors where useful.

The UI should not need to understand raw HTTP implementation details.

Example:

```ts
try {
  await projectService.createProject(data);
} catch (error) {
  // Display user-friendly message
}
```

Do not expose internal server errors directly to users.

---

# 34. Environment Configuration

Environment-specific configuration belongs in environment variables.

Never hard-code:

```text
Database URLs
JWT secrets
API keys
Private tokens
Production credentials
```

Use:

```text
.env
.env.example
```

`.env` must not be committed.

`.env.example` should document required variables without containing secrets.

---

# 35. Git Workflow

Use meaningful progressive commits.

Preferred examples:

```text
feat: initialize TeamFlow application
feat: implement authentication flow
feat: add application shell and navigation
feat: implement dashboard metrics
feat: implement project CRUD
feat: add project detail page
feat: implement Kanban task board
feat: add task drag and drop
feat: add team member management
feat: implement activity timeline
feat: add search and filtering
feat: add dark mode
fix: correct mobile sidebar behavior
fix: persist task status after drag and drop
refactor: extract reusable project components
```

Avoid:

```text
final
done
changes
update
stuff
fix
```

Keep commits focused.

Do not wait until the end of the project to create all commits.

---

# 36. Development Workflow

Claude should follow this general sequence.

## Phase 1 — Foundation

1. Inspect repository.
2. Understand existing files.
3. Confirm framework/tooling.
4. Set up React + Vite + TypeScript.
5. Configure Tailwind.
6. Configure routing.
7. Configure environment variables.
8. Establish project structure.
9. Establish design tokens.
10. Create application shell.

Do not begin by creating every page at once.

---

## Phase 2 — Data & Authentication

Implement:

1. Database
2. Database schema/models
3. Backend
4. API structure
5. Authentication
6. Protected routes
7. User session handling

Verify persistence before building complex UI.

---

## Phase 3 — Core Domain

Implement:

1. Projects
2. Tasks
3. Team members
4. Relationships
5. Activity records

Verify CRUD operations independently.

---

## Phase 4 — User Experience

Implement:

1. Dashboard
2. Project list
3. Project detail
4. Kanban board
5. Task forms
6. Team section
7. Activity timeline
8. Search/filter/sort

---

## Phase 5 — Polish

Implement:

1. Loading states
2. Error states
3. Empty states
4. Toast feedback
5. Confirmation dialogs
6. Dark mode
7. Responsive behavior
8. Accessibility
9. Performance improvements

---

## Phase 6 — Validation

Before considering the project complete, test:

### Authentication

* Register
* Login
* Logout
* Refresh session
* Unauthorized route

### Projects

* Create
* View
* Edit
* Delete

### Tasks

* Create
* View
* Edit
* Delete
* Assign
* Move between columns
* Persist status

### Team

* Add member
* Assign member
* View assignments

### Search

* Search
* Filter
* Sort
* Combine filters
* Empty results

### Activity

Verify meaningful actions generate activity.

### UI

Check:

* Mobile
* Tablet
* Desktop
* Light mode
* Dark mode
* Loading
* Empty
* Error
* Hover
* Focus
* Disabled states

---

# 37. Definition of Done

A feature is not complete merely because the UI exists.

A feature is complete when:

```text
UI exists
+
Interaction works
+
Data is persisted
+
Errors are handled
+
Loading state exists
+
Empty state exists where relevant
+
Responsive behavior works
+
Dark mode works
+
Accessibility is reasonable
+
No obvious console errors
```

---

# 38. Code Review Rules

Before finalizing code, Claude should ask:

### Architecture

* Is this logic in the correct layer?
* Can an existing component be reused?
* Am I creating unnecessary abstraction?

### TypeScript

* Are entities properly typed?
* Did I introduce unnecessary `any`?
* Are API responses typed?

### UX

* What happens when there is no data?
* What happens when the API fails?
* What happens while loading?
* What happens after success?

### Responsive

* Does this work at 375px?
* Does this work at 768px?
* Does this work at 1440px?

### Accessibility

* Can this be used with a keyboard?
* Are inputs labelled?
* Are buttons accessible?
* Are focus states visible?

### Security

* Did I expose a secret?
* Did I hard-code credentials?
* Are protected routes actually protected?

---

# 39. Avoid These Patterns

Do not:

### Create giant components

Avoid:

```text
App.tsx
└── 2000+ lines
```

Split responsibilities.

---

### Duplicate business logic

Avoid implementing project status formatting independently in ten components.

Create reusable utilities/components.

---

### Hard-code application data

Do not fake the application with static arrays once persistence is required.

Bad:

```ts
const projects = [
  { name: "Website Redesign" },
  { name: "Mobile App" }
];
```

Use the database/API for actual application data.

Seed data may be used for demo purposes.

---

### Ignore errors

Never assume:

```text
API call = success
```

Handle failure paths.

---

### Build pages without integration

Do not build:

```text
Dashboard
Projects
Tasks
Team
```

as isolated mock pages.

They should share the same underlying data model.

---

### Overuse modals

Use modals for focused interactions.

For complex workflows, use dedicated pages or appropriate drawers/sheets.

---

### Ignore mobile

Mobile responsiveness must be considered while building components, not only at the end.

---

# 40. Visual Quality Standard

The finished application should feel comparable in professionalism to a modern SaaS product.

Prioritize:

```text
Information hierarchy
Consistency
Clarity
Spacing
Typography
Interaction feedback
Data density
Responsiveness
Accessibility
```

Avoid:

```text
Excessive gradients
Random colors
Inconsistent spacing
Oversized cards
Decorative charts
Generic dashboard templates
Unnecessary animations
Visual clutter
```

The interface should feel intentional.

---

# 41. Animation

Use animation sparingly.

Good uses:

* Modal transitions
* Sidebar transitions
* Toast appearance
* Drag-and-drop feedback
* Page transitions
* Hover feedback

Avoid:

* Excessive page animations
* Distracting dashboard effects
* Animating every card
* Animation that slows interaction

Functionality takes priority over visual effects.

---

# 42. Originality

TeamFlow must have its own visual identity.

It is acceptable to learn from:

* Linear
* Jira
* Trello
* Asana

But do not reproduce:

* Their exact layouts
* Their branding
* Their colors
* Their icons
* Their screenshots
* Their proprietary assets
* Their exact component designs

Create an original SaaS interface.

---

# 43. Documentation

Maintain a useful `README.md`.

It should include:

```text
Project Overview
Features
Technology Stack
Architecture
Installation
Environment Variables
Local Development
Database Setup
Available Scripts
Libraries
Deployment
Demo Credentials
Known Limitations
```

Document meaningful architectural decisions.

Do not write documentation that claims features exist when they do not.

---

# 44. Deployment

The final application must be publicly accessible.

Possible platforms:

* Vercel
* Netlify
* Render
* Cloudflare
* Supabase
* Other suitable platforms

The deployed application must represent the actual repository implementation.

Before final delivery:

1. Build production version.
2. Verify environment variables.
3. Verify database connectivity.
4. Verify authentication.
5. Verify CRUD.
6. Verify Kanban persistence.
7. Verify responsive behavior.
8. Verify public URL.
9. Verify there are no obvious production errors.

---

# 45. Final Quality Gate

Before declaring TeamFlow complete, Claude must verify the following.

## Product

* [ ] Authentication works
* [ ] Protected routes work
* [ ] Dashboard works
* [ ] Project CRUD works
* [ ] Task CRUD works
* [ ] Kanban drag/drop works
* [ ] Task status persists
* [ ] Team members work
* [ ] Task assignment works
* [ ] Activity system works
* [ ] Search works
* [ ] Filtering works
* [ ] Sorting works
* [ ] Analytics are meaningful

## UX

* [ ] Loading states
* [ ] Empty states
* [ ] Error states
* [ ] Toast feedback
* [ ] Delete confirmation
* [ ] Form validation
* [ ] Responsive navigation
* [ ] Light mode
* [ ] Dark mode

## Engineering

* [ ] TypeScript is properly used
* [ ] Minimal unnecessary `any`
* [ ] Components are reusable
* [ ] API logic is organized
* [ ] Environment variables are safe
* [ ] No secrets committed
* [ ] No obvious console errors
* [ ] No unnecessary dependencies
* [ ] No major duplicated logic

## Responsive

* [ ] 375px
* [ ] 768px
* [ ] 1440px

## Accessibility

* [ ] Keyboard navigation
* [ ] Focus states
* [ ] Form labels
* [ ] Semantic HTML
* [ ] Accessible dialogs
* [ ] Sufficient contrast

## Delivery

* [ ] README complete
* [ ] `.env.example` included
* [ ] Git history contains meaningful commits
* [ ] Production build succeeds
* [ ] Database persists correctly
* [ ] Public deployment works
* [ ] Live URL represents current implementation

---

# 46. Claude's Working Rules

When working on TeamFlow:

1. **Inspect before modifying.**
2. **Understand existing architecture before introducing new patterns.**
3. **Reuse existing components and utilities whenever appropriate.**
4. **Do not rewrite working code without a reason.**
5. **Make small, coherent changes.**
6. **Run relevant tests/type checks/builds after meaningful changes.**
7. **Fix errors instead of hiding them.**
8. **Keep TypeScript strict and useful.**
9. **Keep UI and business logic reasonably separated.**
10. **Never hard-code secrets.**
11. **Never fake functionality that is supposed to persist.**
12. **Consider responsive behavior while implementing every major UI component.**
13. **Consider light/dark themes while implementing every major UI component.**
14. **Use accessible HTML and interactions by default.**
15. **Prefer simple solutions over unnecessary abstractions.**
16. **Do not introduce dependencies without a clear reason.**
17. **Do not copy reference products.**
18. **Do not mark a feature complete until its important states have been handled.**
19. **Keep documentation synchronized with the actual implementation.**
20. **Prioritize a polished, reliable user experience over unnecessary technical complexity.**

---

# 47. Priority Order

When requirements conflict, prioritize in this order:

```text
1. Correct functionality
2. Data integrity
3. User experience
4. Security
5. Accessibility
6. Responsive behavior
7. Maintainability
8. Performance
9. Visual polish
10. Extra features
```

Do not sacrifice core functionality to add decorative features.

---

# 48. Guiding Principle

TeamFlow should ultimately answer this question:

> "Could a real small software team use this application every day to manage its projects and tasks?"

If the answer is no, continue improving the product.

Build TeamFlow as a coherent SaaS product—not as a collection of assessment requirements.
