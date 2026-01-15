import { useAuth } from '../contexts/AuthContext.jsx'
import './Dashboard.css'

const Dashboard = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>CRM Dashboard</h1>
          <div className="user-info">
            <div className="user-details">
              <span className="user-email">{user?.email}</span>
              <span className="user-id">ID: {user?.id}</span>
            </div>
            <button onClick={handleSignOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome to your CRM Portal!</h2>
          <p>You have successfully signed in.</p>
          {user?.user_metadata && (
            <div className="user-metadata">
              <h3>User Information:</h3>
              <pre>{JSON.stringify(user.user_metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
