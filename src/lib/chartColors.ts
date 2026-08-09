import type { ProjectStatus, TaskStatus } from '@/types/enums'

// Validated via the dataviz skill's palette validator (adjacent-pair CVD/contrast checks pass
// in both modes; the light-mode contrast WARN is mitigated by always pairing these fills with
// direct category + value labels, never color alone).
export const PROJECT_STATUS_CHART_COLORS: Record<ProjectStatus, { light: string; dark: string }> = {
  PLANNING: { light: '#eda100', dark: '#c98500' },
  ACTIVE: { light: '#2a78d6', dark: '#3987e5' },
  ON_HOLD: { light: '#eb6834', dark: '#d95926' },
  COMPLETED: { light: '#1baf7a', dark: '#199e70' },
}

export const TASK_STATUS_CHART_COLORS: Record<TaskStatus, { light: string; dark: string }> = {
  TODO: { light: '#eda100', dark: '#c98500' },
  IN_PROGRESS: { light: '#2a78d6', dark: '#3987e5' },
  REVIEW: { light: '#4a3aa7', dark: '#9085e9' },
  COMPLETED: { light: '#1baf7a', dark: '#199e70' },
}
