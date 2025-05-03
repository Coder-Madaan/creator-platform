import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Button,
  Spinner,
  Progress,
  HStack,
  Text,
  Badge,
  VStack,
  Tooltip
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiRefreshCw, FiTrendingUp } from 'react-icons/fi'

import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { savedPostService } from '../services/savedPostService'

const MotionCard = motion(Card)

const Dashboard = () => {
  const { user, refreshUser } = useAuth()
  const [stats, setStats] = useState({
    totalCredits: user?.credits || 0,
    recentChanges: [],
    savedPosts: 0,
    profileCompletion: 0,
    availableCredits: 0,
    loading: true,
  })

  const calculateProfileStats = () => {
    const fields = {
      bio: Boolean(user?.profile?.bio),
      avatar: Boolean(user?.profile?.avatar && !user?.profile?.avatar.includes('ui-avatars.com')),
      location: Boolean(user?.profile?.location),
      profession: Boolean(user?.profile?.profession),
      socialLinks: Boolean(
        user?.profile?.socialLinks?.twitter || 
        user?.profile?.socialLinks?.instagram ||
        user?.profile?.socialLinks?.website
      )
    }

    const rewards = {
      bio: 5,
      avatar: 10,
      location: 3,
      profession: 5,
      socialLinks: 7
    }

    const completed = Object.values(fields).filter(Boolean).length
    const total = Object.keys(fields).length
    const percentage = Math.round((completed / total) * 100)

    const availableCredits = Object.entries(fields)
      .filter(([key, isComplete]) => !isComplete)
      .reduce((acc, [key]) => acc + rewards[key], 0)

    return { percentage, availableCredits, fields, rewards }
  }

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }))
      
      // Get credit balance and history
      const creditsResponse = await api.get('/credits/balance')
      const currentCredits = creditsResponse.data.credits
      const recentChanges = creditsResponse.data.recentChanges || []
      
      // Get saved posts count
      const savedPosts = await savedPostService.getSavedPosts()
      
      // Calculate profile completion and available credits
      const { percentage, availableCredits } = calculateProfileStats()
      
      setStats({
        totalCredits: currentCredits,
        recentChanges,
        savedPosts: savedPosts.length,
        profileCompletion: percentage,
        availableCredits,
        loading: false
      })

      // Refresh user context to ensure consistent state
      await refreshUser()
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    fetchStats()
  }, []) // Run only on mount

  // Update stats when user profile or credits change
  useEffect(() => {
    if (user) {
      const { percentage, availableCredits } = calculateProfileStats()
      setStats(prev => ({
        ...prev,
        totalCredits: user.credits || 0,
        profileCompletion: percentage,
        availableCredits
      }))
    }
  }, [user])

  if (stats.loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    )
  }

  // Calculate total recent changes
  const totalChange = stats.recentChanges.reduce((sum, change) => sum + change.amount, 0)

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Dashboard</Heading>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={fetchStats}
          isLoading={stats.loading}
        >
          Refresh
        </Button>
      </Flex>

      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        <GridItem colSpan={4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardBody>
              <Stat>
                <StatLabel>Total Credits</StatLabel>
                <StatNumber>{stats.totalCredits}</StatNumber>
                {totalChange !== 0 && (
                  <StatHelpText>
                    <StatArrow type={totalChange >= 0 ? 'increase' : 'decrease'} />
                    {Math.abs(totalChange)} credits recently
                  </StatHelpText>
                )}
                {stats.recentChanges.length > 0 && (
                  <VStack align="stretch" mt={2} spacing={1}>
                    {stats.recentChanges.map((change, index) => (
                      <Tooltip 
                        key={index}
                        label={new Date(change.timestamp).toLocaleString()}
                        placement="bottom"
                      >
                        <Text fontSize="xs" color={change.amount >= 0 ? "green.500" : "red.500"}>
                          {change.amount >= 0 ? '+' : ''}{change.amount} ({change.reason})
                        </Text>
                      </Tooltip>
                    ))}
                  </VStack>
                )}
              </Stat>
            </CardBody>
          </MotionCard>
        </GridItem>

        <GridItem colSpan={4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CardBody>
              <Stat>
                <StatLabel>Profile Completion</StatLabel>
                <HStack spacing={4} align="center" mt={2}>
                  <StatNumber>{stats.profileCompletion}%</StatNumber>
                  <Progress 
                    value={stats.profileCompletion} 
                    size="sm"
                    colorScheme={stats.profileCompletion === 100 ? 'green' : 'blue'}
                    borderRadius="full"
                    flex={1}
                  />
                </HStack>
                <StatHelpText>
                  {stats.availableCredits > 0 ? (
                    <Badge colorScheme="blue" mt={1}>
                      +{stats.availableCredits} credits available
                    </Badge>
                  ) : (
                    <Badge colorScheme="green" mt={1}>Profile Complete!</Badge>
                  )}
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>
        </GridItem>

        <GridItem colSpan={4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <CardBody>
              <Stat>
                <StatLabel>Saved Posts</StatLabel>
                <StatNumber>{stats.savedPosts}</StatNumber>
                <StatHelpText>
                  Posts you've saved
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default Dashboard
