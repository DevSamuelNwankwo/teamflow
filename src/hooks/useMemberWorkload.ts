import { useMemo } from 'react'
import { useProjects } from './useProjects'
import { useAllTasks } from './useTasks'

export interface MemberWorkload {
  projectNames: string[]
  taskCount: number
}

/** Derives each member's assigned projects/tasks from the project and task queries the app
 *  already has cached elsewhere — no dedicated endpoint needed at this data scale. Used by the
 *  Team page to satisfy "assigned projects/tasks" without a new round trip. */
export function useMemberWorkload(): {
  workloadByMemberId: Map<string, MemberWorkload>
  isLoading: boolean
  isError: boolean
} {
  const projectsQuery = useProjects()
  const tasksQuery = useAllTasks()

  const workloadByMemberId = useMemo(() => {
    const map = new Map<string, MemberWorkload>()

    function entryFor(memberId: string): MemberWorkload {
      let entry = map.get(memberId)
      if (!entry) {
        entry = { projectNames: [], taskCount: 0 }
        map.set(memberId, entry)
      }
      return entry
    }

    for (const project of projectsQuery.data ?? []) {
      for (const member of project.members) {
        entryFor(member.id).projectNames.push(project.name)
      }
    }
    for (const task of tasksQuery.data ?? []) {
      if (task.assigned_member_id) entryFor(task.assigned_member_id).taskCount += 1
    }

    return map
  }, [projectsQuery.data, tasksQuery.data])

  return {
    workloadByMemberId,
    isLoading: projectsQuery.isLoading || tasksQuery.isLoading,
    isError: projectsQuery.isError || tasksQuery.isError,
  }
}
