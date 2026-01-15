import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/" replace />
}

export default ProtectedRoute
