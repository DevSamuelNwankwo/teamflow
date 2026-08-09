import { supabase } from './supabaseClient'
import { getReadableError } from './errors'
import { activityApi } from './activityApi'
import type { Profile } from '@/types/profile'
import type { Project, ProjectInsert, ProjectUpdate, ProjectWithMembers } from '@/types/project'

interface ProjectRowWithMembers extends Project {
  project_members: { profiles: Profile }[]
}

function toProjectWithMembers(row: ProjectRowWithMembers): ProjectWithMembers {
  const { project_members, ...project } = row
  return { ...project, members: project_members.map((pm) => pm.profiles) }
}

const PROJECT_WITH_MEMBERS_SELECT = '*, project_members(profiles(*))'

export interface CreateProjectInput extends ProjectInsert {
  memberIds?: string[]
}

export interface UpdateProjectInput extends ProjectUpdate {
  memberIds?: string[]
}

export const projectsApi = {
  async list(): Promise<ProjectWithMembers[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(PROJECT_WITH_MEMBERS_SELECT)
      .order('created_at', { ascending: false })
    if (error) throw new Error(getReadableError(error))
    return (data as unknown as ProjectRowWithMembers[]).map(toProjectWithMembers)
  },

  async getById(id: string): Promise<ProjectWithMembers | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(PROJECT_WITH_MEMBERS_SELECT)
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(getReadableError(error))
    return data ? toProjectWithMembers(data as unknown as ProjectRowWithMembers) : null
  },

  async create(input: CreateProjectInput, actorId: string, actorName: string): Promise<ProjectWithMembers> {
    const { memberIds = [], ...projectFields } = input

    const { data: project, error } = await supabase
      .from('projects')
      .insert({ ...projectFields, created_by: actorId })
      .select()
      .single()
    if (error) throw new Error(getReadableError(error))

    if (memberIds.length > 0) {
      const { error: memberError } = await supabase
        .from('project_members')
        .insert(memberIds.map((member_id) => ({ project_id: project.id, member_id })))
      if (memberError) throw new Error(getReadableError(memberError))
    }

    await activityApi.log({
      type: 'PROJECT_CREATED',
      actorId,
      projectId: project.id,
      message: `${actorName} created project "${project.name}"`,
    })

    const full = await projectsApi.getById(project.id)
    if (!full) throw new Error('Project was created but could not be reloaded.')
    return full
  },

  async update(
    id: string,
    input: UpdateProjectInput,
    actorId: string,
    actorName: string,
  ): Promise<ProjectWithMembers> {
    const { memberIds, ...projectFields } = input
    const previous = await projectsApi.getById(id)

    const { error } = await supabase
      .from('projects')
      .update(projectFields)
      .eq('id', id)
    if (error) throw new Error(getReadableError(error))

    if (memberIds) {
      const { error: deleteError } = await supabase.from('project_members').delete().eq('project_id', id)
      if (deleteError) throw new Error(getReadableError(deleteError))
      if (memberIds.length > 0) {
        const { error: insertError } = await supabase
          .from('project_members')
          .insert(memberIds.map((member_id) => ({ project_id: id, member_id })))
        if (insertError) throw new Error(getReadableError(insertError))
      }
    }

    const full = await projectsApi.getById(id)
    if (!full) throw new Error('Project was updated but could not be reloaded.')

    if (previous && projectFields.status && previous.status !== projectFields.status) {
      await activityApi.log({
        type: projectFields.status === 'COMPLETED' ? 'PROJECT_COMPLETED' : 'PROJECT_STATUS_CHANGED',
        actorId,
        projectId: id,
        message: `${actorName} moved project "${full.name}" to ${projectFields.status.replace('_', ' ')}`,
        metadata: { from: previous.status, to: projectFields.status },
      })
    } else {
      await activityApi.log({
        type: 'PROJECT_UPDATED',
        actorId,
        projectId: id,
        message: `${actorName} updated project "${full.name}"`,
      })
    }

    return full
  },

  async delete(id: string, actorId: string, actorName: string, projectName: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw new Error(getReadableError(error))

    await activityApi.log({
      type: 'PROJECT_DELETED',
      actorId,
      message: `${actorName} deleted project "${projectName}"`,
    })
  },
}
