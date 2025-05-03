import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
  FormErrorMessage,
  VStack,
  Badge,
  HStack,
} from '@chakra-ui/react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

const MotionBox = motion(Box)

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const { login, loading, error } = useAuth()

  const handleTogglePassword = () => setShowPassword(!showPassword)

  const validateForm = () => {
    let isValid = true
    
    // Reset errors
    setEmailError('')
    setPasswordError('')
    
    // Validate email
    if (!email) {
      setEmailError('Email is required')
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid')
      isValid = false
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    }
    
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      await login(email, password, isAdminLogin)
    }
  }

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box mb={8}>
        <HStack spacing={3} mb={2}>
          <Heading size="xl">Welcome back</Heading>
          {isAdminLogin && (
            <Badge colorScheme="purple" fontSize="0.8em" p={1}>
              Admin Portal
            </Badge>
          )}
        </HStack>
        <Text color="neutral.600">
          Sign in to {isAdminLogin ? 'admin portal' : 'continue to your account'}
        </Text>
      </Box>

      <VStack as="form" spacing={4} onSubmit={handleSubmit}>
        <FormControl isInvalid={!!emailError} isRequired>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            size="lg"
            focusBorderColor={isAdminLogin ? "purple.500" : "primary.500"}
          />
          <FormErrorMessage>{emailError}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!passwordError} isRequired>
          <FormLabel htmlFor="password">Password</FormLabel>
          <InputGroup size="lg">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              focusBorderColor={isAdminLogin ? "purple.500" : "primary.500"}
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                variant="ghost"
                onClick={handleTogglePassword}
                tabIndex="-1"
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{passwordError}</FormErrorMessage>
        </FormControl>

        {error && (
          <Text color="error.500" fontSize="sm" mt={2}>
            {error}
          </Text>
        )}

        <Button
          type="submit"
          colorScheme={isAdminLogin ? "purple" : "primary"}
          size="lg"
          width="full"
          mt={6}
          isLoading={loading}
          loadingText="Signing in"
        >
          Sign In {isAdminLogin ? 'as Admin' : ''}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdminLogin(!isAdminLogin)}
          mt={2}
        >
          {isAdminLogin ? 'Switch to User Login' : 'Admin Login'}
        </Button>
      </VStack>

      {!isAdminLogin && (
        <Text mt={8} textAlign="center">
          Don't have an account?{' '}
          <Link as={RouterLink} to="/register" color="primary.500" fontWeight="semibold">
            Sign up
          </Link>
        </Text>
      )}

      {/* Demo credentials */}
      <Box mt={8} p={4} bg="neutral.50" borderRadius="md">
        <Text fontSize="sm" color="neutral.600" mb={2} fontWeight="medium">
          Demo Credentials
        </Text>
        {isAdminLogin ? (
          <Text fontSize="xs" color="neutral.500">
            <strong>Admin:</strong> admin@example.com / admin123
          </Text>
        ) : (
          <>
            <Text fontSize="xs" color="neutral.500">
              <strong>User:</strong> user@example.com / password123
            </Text>
            <Text fontSize="xs" color="neutral.500">
              <strong>Admin:</strong> admin@example.com / admin123
            </Text>
          </>
        )}
      </Box>
    </MotionBox>
  )
}

export default Login