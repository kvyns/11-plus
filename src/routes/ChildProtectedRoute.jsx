import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'

function ChildProtectedRoute() {
  const { isLoggedIn, accountType } = useAppStore()

  if (!isLoggedIn || accountType !== 'child') {
    return <Navigate to="/child-login" replace />
  }

  return <Outlet />
}

export default ChildProtectedRoute
