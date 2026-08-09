import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import { useUiStore } from '@/stores/uiStore'
import { router } from '@/routes/router'

function App() {
  const theme = useUiStore((s) => s.theme)

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster theme={theme} position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
