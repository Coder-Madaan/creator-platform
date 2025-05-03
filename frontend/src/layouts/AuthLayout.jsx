import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Box, Flex, Container, Image, Heading, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const MotionBox = motion(Box)

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Flex minH="100vh" bg="neutral.50">
      {/* Left side - Illustration/Branding */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        flex="1"
        bgGradient="linear(to-b, primary.500, secondary.500)"
        color="white"
        p={8}
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" bottom={0} left={0} width="100%" height="100%">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 500 500"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.1, position: 'absolute', bottom: '-200px' }}
          >
            <path
              d="M488.6,155.5c-40.8-90.5-167.2-102.7-304.4-74.2S-13.4,189.6,3.5,271.8s122.6,97.4,243.8,60.4S529.4,245.9,488.6,155.5z"
              fill="#fff"
            />
          </svg>
        </Box>

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          mb={16}
        >
          <Heading size="2xl" mb={4}>
            CreatorHub
          </Heading>
          <Text fontSize="xl" maxW="400px">
            Manage your profile, earn credits, and discover content tailored just for you.
          </Text>
        </MotionBox>

        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          position="absolute"
          bottom="10%"
          left="50%"
          transform="translateX(-50%)"
          maxW="80%"
        >
          <Image
            src="https://images.pexels.com/photos/7256897/pexels-photo-7256897.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
            alt="Creators working together"
            borderRadius="lg"
            shadow="xl"
          />
        </MotionBox>
      </Box>

      {/* Right side - Auth Form */}
      <Flex
        direction="column"
        flex={{ base: "1", lg: "0.8" }}
        px={{ base: 4, sm: 6, md: 8 }}
        py={12}
      >
        <Container maxW="md">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box display={{ base: 'block', lg: 'none' }} mb={8}>
              <Heading size="xl" color="primary.600">
                CreatorHub
              </Heading>
              <Text color="neutral.600" mt={2}>
                Join our platform for creators
              </Text>
            </Box>

            <Outlet />
          </MotionBox>
        </Container>
      </Flex>
    </Flex>
  )
}

export default AuthLayout