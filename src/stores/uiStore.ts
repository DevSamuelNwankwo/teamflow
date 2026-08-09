import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface UiState {
  theme: Theme
  sidebarCollapsed: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  toggleSidebar: () => void
}

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/** Client/UI state only — theme + sidebar collapse. Server data (projects, tasks, etc.)
 *  is owned entirely by TanStack Query and must never be mirrored in here. */
export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarCollapsed: false,
      setTheme: (theme) => {
        applyThemeClass(theme)
        set({ theme })
      },
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        applyThemeClass(next)
        set({ theme: next })
      },
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'teamflow-ui',
      onRehydrateStorage: () => (state) => {
        // Re-apply the persisted theme's class once the store rehydrates from localStorage,
        // in case the inline pre-hydration script (index.html) picked a different default.
        if (state) applyThemeClass(state.theme)
      },
    },
  ),
)
