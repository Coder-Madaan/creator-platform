import React from 'react'
import { createContext, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { jwtDecode } from 'jwt-decode'
import api from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()

  const setSession = (token) => {
    if (token) {
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  const handleLogout = useCallback(() => {
    // Clear all auth-related storage
    localStorage.removeItem('token')
    localStorage.removeItem('lastLoginDate')
    sessionStorage.clear()
    
    // Clear auth state
    setSession(null)
    setUser(null)
    setError(null)
    
    // Clear axios default headers
    delete api.defaults.headers.common['Authorization']
    
    navigate('/login')
    toast({
      title: 'Logged out',
      description: 'Your session has ended',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }, [navigate, toast])

  useEffect(() => {
    // Listen for auth:logout event
    const handleAuthLogout = () => handleLogout()
    window.addEventListener('auth:logout', handleAuthLogout)
    
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout)
    }
  }, [handleLogout])

  const checkAuth = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setUser(null)
        setLoading(false)
        return false
      }
      
      // Check if token is expired
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000
      
      if (decoded.exp < currentTime) {
        handleLogout()
        return false
      }
      
      // Token is valid, get user data
      setSession(token) // Ensure token is set in headers
      const response = await api.get('/users/profile')
      
      // Map username to name for frontend compatibility
      const userWithName = {
        ...response.data,
        name: response.data.username
      }
      
      setUser(userWithName)
      setLoading(false)
      return true
    } catch (err) {
      console.error('Auth check failed:', err)
      // Only clear session if it's an authentication error
      if (err.response?.status === 401) {
        handleLogout()
      }
      setLoading(false)
      return false
    }
  }, [handleLogout])

  const login = async (email, password, isAdmin = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.post('/auth/login', { email, password, isAdmin })
      const { token, ...userData } = response.data // Destructure token and remaining user data
      
      // Map username to name for frontend compatibility
      const userWithName = {
        ...userData,
        name: userData.username
      }
      
      setSession(token)
      setUser(userWithName)
      
      // Show different toast messages based on login reward
      if (userData.loginReward) {
        toast({
          title: 'Login successful',
          description: `Welcome back, ${userWithName.name}! You earned ${userData.loginReward} credits for daily login.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Login successful',
          description: `Welcome back, ${userWithName.name}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
      return true
    } catch (err) {
      console.error('Login failed:', err)
      setError(err.response?.data?.message || 'Login failed')
      toast({
        title: 'Login failed',
        description: err.response?.data?.message || 'Please check your credentials',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      
      // Ensure username is included in the registration data
      const registrationData = {
        ...userData,
        username: userData.username || userData.email.split('@')[0] // Use email prefix as username if not provided
      }
      
      const response = await api.post('/auth/register', registrationData)
      const { token, user } = response.data
      
      // Map username to name for frontend compatibility
      const userWithName = {
        ...user,
        name: user.username
      }
      
      setSession(token)
      setUser(userWithName)
      
      toast({
        title: 'Registration successful',
        description: `Welcome, ${userWithName.name}! You received 100 credits as a welcome bonus.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      navigate('/dashboard')
      return true
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to register'
      setError(message)
      toast({
        title: 'Registration failed',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    handleLogout()
  }

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/users/profile');
      const userWithName = {
        ...response.data,
        name: response.data.username
      };
      setUser(userWithName);
      return true;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}