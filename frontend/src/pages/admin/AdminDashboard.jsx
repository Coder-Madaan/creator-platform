import React from 'react'
import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Select,
  Button,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Tooltip,
  IconButton,
  Avatar,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react'
import { FiUsers, FiCreditCard, FiActivity, FiAlertCircle, FiClock, FiBarChart2, FiCalendar, FiEye } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { format, isValid } from 'date-fns'
import api from '../../services/api'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
)

const MotionBox = motion(Box)
const MotionCard = motion(Card)

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('week')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCredits: 0,
    pendingReports: 0
  })
  const [chartData, setChartData] = useState({
    userActivity: {},
    creditDistribution: {},
    contentEngagement: {}
  })
  const [topUsers, setTopUsers] = useState([])

  const formatDate = (date) => {
    if (!date) return '';
    const parsedDate = new Date(date);
    return isValid(parsedDate) ? format(parsedDate, 'h:mm a') : '';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data
      const analytics = await api.get('/admin/analytics');
      setStats({
        totalUsers: analytics.data.totalUsers || 0,
        activeUsers: analytics.data.activeToday || 0,
        totalCredits: analytics.data.totalCredits || 0,
        pendingReports: analytics.data.pendingReports || 0
      });

      // Fetch activity data for charts
      const activity = await api.get(`/admin/activity?timeRange=${timeRange}`);
      setChartData({
        userActivity: {
          labels: activity.data.dates,
          datasets: [
            {
              label: 'New Users',
              data: activity.data.newUsers,
              borderColor: 'rgb(51, 102, 255)',
              backgroundColor: 'rgba(51, 102, 255, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Active Users',
              data: activity.data.activeUsers,
              borderColor: 'rgb(153, 102, 255)',
              backgroundColor: 'rgba(153, 102, 255, 0.1)',
              tension: 0.4,
              fill: true,
            }
          ]
        },
        contentEngagement: {
          labels: activity.data.dates,
          datasets: [
            {
              label: 'Saved Content',
              data: activity.data.savedContent,
              backgroundColor: 'rgba(51, 102, 255, 0.7)',
            },
            {
              label: 'Shared Content',
              data: activity.data.sharedContent,
              backgroundColor: 'rgba(255, 102, 51, 0.7)',
            },
            {
              label: 'Reported Content',
              data: activity.data.reportedContent,
              backgroundColor: 'rgba(255, 204, 0, 0.7)',
            }
          ]
        }
      });

      // Fetch top users
      const users = await api.get('/admin/top-users');
      setTopUsers(users.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  useEffect(() => {
    // Cleanup function to destroy all chart instances when component unmounts
    return () => {
      const charts = ChartJS.instances;
      Object.keys(charts).forEach(key => {
        charts[key].destroy();
      });
    };
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    )
  }

  return (
    <Box>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header section */}
        <Flex 
          justify="space-between" 
          align={{ base: 'stretch', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          mb={6}
          gap={4}
        >
          <Box>
            <Heading size="lg">Admin Dashboard</Heading>
            <Text color="neutral.600" mt={1}>
              Platform overview and analytics
            </Text>
          </Box>
          
          <HStack spacing={4}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              width={{ base: 'full', md: '160px' }}
              bg="white"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
            </Select>
            
            <Button leftIcon={<FiCalendar />} colorScheme="primary" variant="outline">
              Export Report
            </Button>
          </HStack>
        </Flex>

        {/* Stats cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {/* Total Users card */}
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            borderRadius="lg"
            boxShadow="md"
          >
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Box
                    bg="primary.50"
                    p={2}
                    borderRadius="md"
                    color="primary.600"
                    mr={3}
                  >
                    <FiUsers size={20} />
                  </Box>
                  <StatLabel fontSize="sm">Total Users</StatLabel>
                </Flex>
                <StatNumber fontSize="2xl">{stats.totalUsers}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  12.5% since last {timeRange}
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          {/* Active Users card */}
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            borderRadius="lg"
            boxShadow="md"
          >
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Box
                    bg="secondary.50"
                    p={2}
                    borderRadius="md"
                    color="secondary.600"
                    mr={3}
                  >
                    <FiActivity size={20} />
                  </Box>
                  <StatLabel fontSize="sm">Active Today</StatLabel>
                </Flex>
                <StatNumber fontSize="2xl">{stats.activeUsers}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  8.2% since yesterday
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          {/* Total Credits card */}
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            borderRadius="lg"
            boxShadow="md"
          >
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Box
                    bg="accent.50"
                    p={2}
                    borderRadius="md"
                    color="accent.600"
                    mr={3}
                  >
                    <FiCreditCard size={20} />
                  </Box>
                  <StatLabel fontSize="sm">Total Credits</StatLabel>
                </Flex>
                <StatNumber fontSize="2xl">{stats.totalCredits}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  18.3% since last {timeRange}
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          {/* Pending Reports card */}
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            borderRadius="lg"
            boxShadow="md"
          >
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Box
                    bg="red.50"
                    p={2}
                    borderRadius="md"
                    color="red.600"
                    mr={3}
                  >
                    <FiAlertCircle size={20} />
                  </Box>
                  <StatLabel fontSize="sm">Pending Reports</StatLabel>
                </Flex>
                <StatNumber fontSize="2xl">{stats.pendingReports}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  5.3% since last {timeRange}
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>
        </SimpleGrid>

        {/* Charts section */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={8}>
          {/* User Activity chart */}
          <GridItem>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              borderRadius="lg"
              boxShadow="md"
              height="100%"
            >
              <CardHeader pb={0}>
                <Flex justify="space-between" align="center">
                  <Heading size="md">User Activity</Heading>
                  <HStack>
                    <Badge colorScheme="blue" variant="subtle">New Users</Badge>
                    <Badge colorScheme="purple" variant="subtle">Active Users</Badge>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                {chartData.userActivity.datasets && (
                  <Box height={{ base: '250px', md: '300px' }}>
                    <Line 
                      data={chartData.userActivity} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              drawBorder: false
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                )}
              </CardBody>
            </MotionCard>
          </GridItem>
        </Grid>

        {/* Content Engagement and Top Users section */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={8}>
          {/* Content Engagement chart */}
          <GridItem>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              borderRadius="lg"
              boxShadow="md"
            >
              <CardHeader pb={0}>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Content Engagement</Heading>
                  <HStack>
                    <Badge colorScheme="blue" variant="subtle">Saved</Badge>
                    <Badge colorScheme="orange" variant="subtle">Shared</Badge>
                    <Badge colorScheme="yellow" variant="subtle">Reported</Badge>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                {chartData.contentEngagement.datasets && (
                  <Box height="250px">
                    <Bar 
                      data={chartData.contentEngagement}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            stacked: true,
                            grid: {
                              drawBorder: false
                            }
                          },
                          x: {
                            stacked: true,
                            grid: {
                              display: false
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                )}
              </CardBody>
            </MotionCard>
          </GridItem>

          {/* Top Users table */}
          <GridItem>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              borderRadius="lg"
              boxShadow="md"
            >
              <CardHeader pb={0}>
                <Heading size="md">Top Users</Heading>
              </CardHeader>
              <CardBody overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>User</Th>
                      <Th isNumeric>Credits</Th>
                      <Th isNumeric>Interactions</Th>
                      <Th>Last Active</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {topUsers.map((user) => (
                      <Tr key={user.id}>
                        <Td>
                          <HStack>
                            <Avatar size="sm" name={user.name} src={user.avatar} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">{user.name}</Text>
                              <Text fontSize="xs" color="neutral.500">{user.email}</Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td isNumeric fontWeight="medium">{user.credits}</Td>
                        <Td isNumeric>{user.interactions}</Td>
                        <Td>
                          <Flex align="center">
                            <FiClock size={12} style={{ marginRight: '4px' }} />
                            <Text fontSize="xs">
                              {formatDate(user.lastActive)}
                            </Text>
                          </Flex>
                        </Td>
                        <Td>
                          <Tooltip label="View Profile" placement="left">
                            <IconButton 
                              aria-label="View profile" 
                              icon={<FiEye size={16} />}
                              variant="ghost"
                              size="sm"
                            />
                          </Tooltip>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Button size="sm" variant="link" colorScheme="primary" mt={4} rightIcon={<FiBarChart2 />}>
                  View Full Report
                </Button>
              </CardBody>
            </MotionCard>
          </GridItem>
        </Grid>
      </MotionBox>
    </Box>
  )
}

export default AdminDashboard