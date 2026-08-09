import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import { DEFAULT_FILTERS, type EntityFilters } from '@/lib/filterSort'

/** Keeps search/status/priority/assignee/sort in the URL's query string, so filter state
 *  survives a refresh, works with the back button, and is bookmarkable/shareable. */
export function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: EntityFilters = useMemo(
    () => ({
      search: searchParams.get('q') ?? DEFAULT_FILTERS.search,
      status: searchParams.get('status') ?? DEFAULT_FILTERS.status,
      priority: searchParams.get('priority') ?? DEFAULT_FILTERS.priority,
      assignee: searchParams.get('assignee') ?? DEFAULT_FILTERS.assignee,
      sort: searchParams.get('sort') ?? DEFAULT_FILTERS.sort,
    }),
    [searchParams],
  )

  function setFilter(key: keyof EntityFilters, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key === 'search' ? 'q' : key, value)
    else next.delete(key === 'search' ? 'q' : key)
    setSearchParams(next, { replace: true })
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  return { filters, setFilter, clearFilters }
}
