import React from 'react'
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'

import { useAuth } from './hooks/useAuth'
import api from './services/api'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import SavedContent from './pages/SavedContent'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import ContentManagement from './pages/admin/ContentManagement'
import NotFound from './pages/NotFound'

function App() {
  const { checkAuth, user, refreshUser } = useAuth()
  const toast = useToast()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user && user.id) {
      const lastLoginDate = localStorage.getItem('lastLoginDate')
      const today = new Date().toDateString()
      
      if (lastLoginDate !== today) {
        // Call backend to award credits
        api.post('/credits/daily-bonus')
          .then(async (response) => {
            localStorage.setItem('lastLoginDate', today)
            
            // Show daily login bonus notification
            toast({
              title: 'Daily Login Bonus!',
              description: `You earned ${response.data.creditChange.amount} credits for logging in today.`,
              status: 'success',
              duration: 5000,
              isClosable: true,
              position: 'bottom-right'
            })

            // Refresh user data to update credits
            await refreshUser()
          })
          .catch(err => {
            // Don't show error if it's just because bonus was already claimed
            if (err.response?.status !== 400) {
              console.error('Failed to award daily bonus:', err)
              toast({
                title: 'Notice',
                description: err.response?.data?.message || 'Unable to process daily bonus',
                status: 'info',
                duration: 5000,
                isClosable: true,
                position: 'bottom-right'
              })
            }
          })
      }
    }
  }, [user, refreshUser, toast])

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/saved" element={<SavedContent />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/content" element={<ContentManagement />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App