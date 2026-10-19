import { HashRouter } from 'react-router-dom'
import { AppRoutes } from '@school/ui/AppRoutes'
import { AuthProvider } from '@school/ui/AuthProvider'
import { LocalDataProvider } from '@school/ui/LocalDataProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false // Good for desktop apps
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AuthProvider>
          <LocalDataProvider>
            <AppRoutes />
          </LocalDataProvider>
        </AuthProvider>
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App
