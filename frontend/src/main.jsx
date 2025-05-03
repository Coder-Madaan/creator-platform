import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { theme } from './styles/theme'
import './styles/globals.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </AuthProvider>
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>,
)