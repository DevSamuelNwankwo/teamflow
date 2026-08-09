import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useUiStore } from '@/stores/uiStore'
import { TASK_STATUS_STYLES } from '@/lib/constants'
import { TASK_STATUS_CHART_COLORS } from '@/lib/chartColors'
import { TASK_STATUSES } from '@/types/enums'
import type { TaskWithAssignee } from '@/types/task'

interface TaskStatusChartProps {
  tasks: TaskWithAssignee[]
}

/** Same single-series horizontal-bar treatment as ProjectStatusChart, applied to task status —
 *  kept as a separate component (rather than a generic <StatusChart status="task">) since the
 *  two work off different enums/color maps; the visual language stays identical. */
export function TaskStatusChart({ tasks }: TaskStatusChartProps) {
  const theme = useUiStore((s) => s.theme)

  const data = TASK_STATUSES.map((status) => ({
    status,
    label: TASK_STATUS_STYLES[status].label,
    count: tasks.filter((t) => t.status === status).length,
  }))

  const gridColor = theme === 'dark' ? '#2c303c' : '#e2e8f0'
  const textColor = theme === 'dark' ? '#b6bccb' : '#475569'

  return (
    <div className="h-56 w-full" role="img" aria-label="Bar chart of task counts by status">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }} barCategoryGap={14}>
          <XAxis type="number" allowDecimals={false} tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={80}
            tick={{ fill: textColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
            contentStyle={{
              background: theme === 'dark' ? '#1d2029' : '#ffffff',
              border: `1px solid ${gridColor}`,
              borderRadius: 8,
              fontSize: 12,
              color: textColor,
            }}
            formatter={(value) => [`${value} task${value === 1 ? '' : 's'}`, '']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={TASK_STATUS_CHART_COLORS[entry.status][theme]} />
            ))}
            <LabelList dataKey="count" position="right" fill={textColor} fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
