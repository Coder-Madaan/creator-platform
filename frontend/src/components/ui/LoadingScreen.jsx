import React from 'react'
import { Box, Flex, Spinner, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const LoadingScreen = () => {
  return (
    <Flex
      height="100vh"
      width="100vw"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      bg="white"
    >
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="neutral.200"
          color="primary.500"
          size="xl"
        />
      </MotionBox>
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Text
          mt={4}
          fontSize="lg"
          fontWeight="medium"
          color="neutral.600"
        >
          Loading...
        </Text>
      </MotionBox>
    </Flex>
  )
}

export default LoadingScreen