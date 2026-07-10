import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'

function ProtectedRoute() {
  const { isLoggedIn, accountType } = useAppStore()

  if (!isLoggedIn || accountType === 'child') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
