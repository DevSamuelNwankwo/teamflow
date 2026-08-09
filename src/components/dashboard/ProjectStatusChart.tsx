import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useUiStore } from '@/stores/uiStore'
import { PROJECT_STATUS_STYLES } from '@/lib/constants'
import { PROJECT_STATUS_CHART_COLORS } from '@/lib/chartColors'
import { PROJECT_STATUSES } from '@/types/enums'
import type { ProjectWithMembers } from '@/types/project'

interface ProjectStatusChartProps {
  projects: ProjectWithMembers[]
}

/** Single-series horizontal bar chart — a status distribution is a magnitude-by-category
 *  comparison across 4 fixed categories, which a bar chart reads better than a donut. No
 *  legend box: the chart title plus each bar's own category label already carry identity. */
export function ProjectStatusChart({ projects }: ProjectStatusChartProps) {
  const theme = useUiStore((s) => s.theme)

  const data = PROJECT_STATUSES.map((status) => ({
    status,
    label: PROJECT_STATUS_STYLES[status].label,
    count: projects.filter((p) => p.status === status).length,
  }))

  const gridColor = theme === 'dark' ? '#2c303c' : '#e2e8f0'
  const textColor = theme === 'dark' ? '#b6bccb' : '#475569'

  return (
    <div className="h-56 w-full" role="img" aria-label="Bar chart of project counts by status">
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
            formatter={(value) => [`${value} project${value === 1 ? '' : 's'}`, '']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={PROJECT_STATUS_CHART_COLORS[entry.status][theme]} />
            ))}
            <LabelList dataKey="count" position="right" fill={textColor} fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
