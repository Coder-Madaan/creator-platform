import React from 'react'
import { Box, Button, Heading, Text, VStack, Icon } from '@chakra-ui/react'
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const NotFound = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bg="neutral.50"
    >
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        maxWidth="400px"
        textAlign="center"
        p={8}
      >
        <Icon as={FiAlertCircle} boxSize={16} color="primary.500" mb={6} />
        <VStack spacing={4}>
          <Heading size="2xl">404</Heading>
          <Heading size="md">Page Not Found</Heading>
          <Text color="neutral.600">
            The page you're looking for doesn't exist or has been moved.
          </Text>
          <Button
            as={RouterLink}
            to="/"
            leftIcon={<FiArrowLeft />}
            colorScheme="primary"
            size="lg"
            mt={4}
          >
            Back to Home
          </Button>
        </VStack>
      </MotionBox>
    </Box>
  )
}

export default NotFound