import { Navigate, useLocation } from 'react-router-dom'
import { getSession } from '@/utils/auth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const session = getSession()

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
