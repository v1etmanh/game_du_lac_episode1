import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { initAnalytics } from './analytics/track.js'
import './index.css'

// Game and admin are separate chunks so neither loads the other's code or CSS.
const isAdmin = window.location.pathname.startsWith('/admin')
const Root = isAdmin ? lazy(() => import('./admin/AdminApp.jsx')) : lazy(() => import('./App.jsx'))
const AuthGate = lazy(() => import('./auth/AuthGate.jsx'))

if (!isAdmin) initAnalytics()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      {isAdmin ? (
        <Root />
      ) : (
        // Players sign in with Google; /admin keeps its own username/password login.
        <AuthGate>
          <Root />
        </AuthGate>
      )}
    </Suspense>
  </React.StrictMode>
)
