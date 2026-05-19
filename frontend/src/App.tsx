import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/MainLayout'
import { RequireAuth } from '@/components/RequireAuth'
import { ChatPage } from '@/pages/ChatPage'
import { KnowledgePage } from '@/pages/KnowledgePage'
import { UserCenterPage } from '@/pages/user/UserCenterPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route
            path="/user"
            element={
              <RequireAuth>
                <UserCenterPage />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
