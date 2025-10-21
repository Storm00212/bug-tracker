/**
 * APPLICATION ENTRY POINT
 *
 * Initializes the React application with all necessary providers and configurations.
 * Sets up React Query for server state management and authentication context.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import App from './App.tsx'

// Create React Query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
})

// Render the application with all providers
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* React Query Provider for server state management */}
    <QueryClientProvider client={queryClient}>
      {/* Authentication Context Provider */}
      <AuthProvider>
        {/* Router Provider for navigation */}
        <BrowserRouter>
          {/* Toast notifications provider */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          {/* Main Application Component */}
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
