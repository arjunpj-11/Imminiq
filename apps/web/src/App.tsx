import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminRoute } from './routes/AdminRoute'

export default function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<div>Landing</div>} />
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/register" element={<div>Register</div>} />

      {/* protected routes — replace divs with real pages as you build */}
      <Route path="/dashboard" element={
        <ProtectedRoute><div>Dashboard</div></ProtectedRoute>
      } />

      {/* admin routes */}
      <Route path="/admin" element={
        <AdminRoute><div>Admin</div></AdminRoute>
      } />
    </Routes>
  )
}