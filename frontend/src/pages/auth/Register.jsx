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
} from '@chakra-ui/react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

const MotionBox = motion(Box)

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const { register, loading, error } = useAuth()

  const handleTogglePassword = () => setShowPassword(!showPassword)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear the specific error when field is changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      const { confirmPassword, ...userData } = formData
      await register(userData)
    }
  }

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box mb={8}>
        <Heading size="xl" mb={2}>
          Create an account
        </Heading>
        <Text color="neutral.600">
          Join our community of creators
        </Text>
      </Box>

      <VStack as="form" spacing={4} onSubmit={handleSubmit}>
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel htmlFor="name">Full Name</FormLabel>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            size="lg"
            focusBorderColor="primary.500"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email} isRequired>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            size="lg"
            focusBorderColor="primary.500"
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password} isRequired>
          <FormLabel htmlFor="password">Password</FormLabel>
          <InputGroup size="lg">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              focusBorderColor="primary.500"
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
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmPassword} isRequired>
          <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            size="lg"
            focusBorderColor="primary.500"
          />
          <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
        </FormControl>

        {error && (
          <Text color="error.500" fontSize="sm" mt={2}>
            {error}
          </Text>
        )}

        <Button
          type="submit"
          colorScheme="primary"
          size="lg"
          width="full"
          mt={6}
          isLoading={loading}
          loadingText="Creating account"
        >
          Sign Up
        </Button>
      </VStack>

      <Text mt={8} textAlign="center">
        Already have an account?{' '}
        <Link as={RouterLink} to="/login" color="primary.500" fontWeight="semibold">
          Sign in
        </Link>
      </Text>
    </MotionBox>
  )
}

export default Register