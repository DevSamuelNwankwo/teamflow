import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KANBAN_COLUMNS } from '@/lib/constants'
import type { TaskStatus } from '@/types/enums'
import type { TaskWithAssignee } from '@/types/task'
import type { ReorderUpdate } from '@/api/tasksApi'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { useReorderTasks } from '@/hooks/useTaskMutations'

type ColumnMap = Record<TaskStatus, TaskWithAssignee[]>

function groupByStatus(tasks: TaskWithAssignee[]): ColumnMap {
  const map = Object.fromEntries(KANBAN_COLUMNS.map((c) => [c.status, [] as TaskWithAssignee[]])) as ColumnMap
  for (const task of [...tasks].sort((a, b) => a.position - b.position)) {
    map[task.status].push(task)
  }
  return map
}

interface KanbanBoardProps {
  projectId: string
  tasks: TaskWithAssignee[]
  onTaskClick: (task: TaskWithAssignee) => void
}

export function KanbanBoard({ projectId, tasks, onTaskClick }: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnMap>(() => groupByStatus(tasks))
  const [activeTask, setActiveTask] = useState<TaskWithAssignee | null>(null)
  const reorderTasks = useReorderTasks(projectId)

  // Re-sync from the server-backed query whenever it changes and we're not mid-drag.
  useEffect(() => {
    if (!activeTask) setColumns(groupByStatus(tasks))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const taskLookup = useMemo(() => {
    const map = new Map<string, TaskWithAssignee>()
    for (const task of tasks) map.set(task.id, task)
    return map
  }, [tasks])

  function findColumnOf(id: string): TaskStatus | undefined {
    return (Object.keys(columns) as TaskStatus[]).find((status) => columns[status].some((t) => t.id === id))
  }

  function handleDragStart(event: DragStartEvent) {
    const task = taskLookup.get(String(event.active.id))
    setActiveTask(task ?? null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const sourceStatus = findColumnOf(activeId)
    const destStatus = (over.data.current?.status as TaskStatus | undefined) ?? findColumnOf(overId)
    if (!sourceStatus || !destStatus || sourceStatus === destStatus) return

    setColumns((prev) => {
      const sourceItems = [...prev[sourceStatus]]
      const activeIndex = sourceItems.findIndex((t) => t.id === activeId)
      if (activeIndex === -1) return prev
      const [moved] = sourceItems.splice(activeIndex, 1)

      const destItems = [...prev[destStatus]]
      const overIndex = destItems.findIndex((t) => t.id === overId)
      const insertAt = overIndex >= 0 ? overIndex : destItems.length
      destItems.splice(insertAt, 0, { ...moved, status: destStatus })

      return { ...prev, [sourceStatus]: sourceItems, [destStatus]: destItems }
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const destStatus = (over.data.current?.status as TaskStatus | undefined) ?? findColumnOf(overId)
    const sourceStatus = findColumnOf(activeId)
    if (!destStatus || !sourceStatus) return

    setColumns((prev) => {
      const destItems = [...prev[destStatus]]
      const activeIndex = destItems.findIndex((t) => t.id === activeId)
      const overIndex = destItems.findIndex((t) => t.id === overId)

      let finalItems = destItems
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        finalItems = [...destItems]
        const [moved] = finalItems.splice(activeIndex, 1)
        finalItems.splice(overIndex, 0, moved)
      }

      const next = { ...prev, [destStatus]: finalItems }

      const updates: ReorderUpdate[] = finalItems.map((t, index) => ({
        id: t.id,
        status: destStatus,
        position: (index + 1) * 1000,
      }))
      if (sourceStatus !== destStatus) {
        prev[sourceStatus]
          .filter((t) => t.id !== activeId)
          .forEach((t, index) => updates.push({ id: t.id, status: sourceStatus, position: (index + 1) * 1000 }))
      }

      reorderTasks.mutate({ updates, movedTaskId: activeId })
      return next
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {KANBAN_COLUMNS.map(({ status, title }) => (
          <KanbanColumn key={status} status={status} title={title} tasks={columns[status]} onTaskClick={onTaskClick} />
        ))}
      </div>

      <DragOverlay>{activeTask && <TaskCard task={activeTask} onClick={() => {}} />}</DragOverlay>
    </DndContext>
  )
}
