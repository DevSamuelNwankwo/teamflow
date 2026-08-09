import { Search, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input, Select } from './Input'
import { Button } from './Button'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { EntityFilters } from '@/lib/filterSort'

interface Option {
  value: string
  label: string
}

interface FilterBarProps {
  filters: EntityFilters
  onChange: (key: keyof EntityFilters, value: string) => void
  onClear: () => void
  hasActiveFilters: boolean
  searchPlaceholder: string
  statusOptions: Option[]
  priorityOptions: Option[]
  assigneeOptions: Option[]
  sortOptions: Option[]
}

/** One filter-bar shape (search + status + priority + assignee + sort) instantiated for both
 *  ProjectsPage and TasksPage — same component, different option lists. */
export function FilterBar({
  filters,
  onChange,
  onClear,
  hasActiveFilters,
  searchPlaceholder,
  statusOptions,
  priorityOptions,
  assigneeOptions,
  sortOptions,
}: FilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebouncedValue(searchInput, 200)

  // Local -> URL: push the debounced value up once typing settles.
  useEffect(() => {
    if (debouncedSearch !== filters.search) onChange('search', debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  // URL -> local: if filters.search changed some other way (Clear filters, back/forward
  // navigation) rather than from our own debounce above, reflect it in the input.
  useEffect(() => {
    if (filters.search !== debouncedSearch) setSearchInput(filters.search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search])

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-8"
          aria-label="Search"
        />
      </div>

      <Select
        value={filters.status}
        onChange={(e) => onChange('status', e.target.value)}
        aria-label="Filter by status"
        className="w-auto"
      >
        <option value="">All statuses</option>
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>

      <Select
        value={filters.priority}
        onChange={(e) => onChange('priority', e.target.value)}
        aria-label="Filter by priority"
        className="w-auto"
      >
        <option value="">All priorities</option>
        {priorityOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>

      <Select
        value={filters.assignee}
        onChange={(e) => onChange('assignee', e.target.value)}
        aria-label="Filter by assignee"
        className="w-auto"
      >
        <option value="">Everyone</option>
        {assigneeOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>

      <Select
        value={filters.sort}
        onChange={(e) => onChange('sort', e.target.value)}
        aria-label="Sort by"
        className="w-auto"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X size={14} /> Clear filters
        </Button>
      )}
    </div>
  )
}
