import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Stat,
  StatNumber,
  StatLabel,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  Progress,
  useToast
} from '@chakra-ui/react'
import { FiSearch, FiFilter, FiEdit2, FiTrash2, FiMoreVertical, FiCreditCard, FiUserPlus, FiUserCheck, FiUserX, FiUser, FiClock, FiEdit, FiChevronDown, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

const MotionBox = motion(Box)

const UserManagement = () => {
  const { refreshUser } = useAuth()
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState({ field: 'lastActive', direction: 'desc' })
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const toast = useToast()
  
  const { 
    isOpen: isUserModalOpen, 
    onOpen: onUserModalOpen, 
    onClose: onUserModalClose 
  } = useDisclosure()
  
  const { 
    isOpen: isCreditModalOpen, 
    onOpen: onCreditModalOpen, 
    onClose: onCreditModalClose 
  } = useDisclosure()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users')
      setUsers(response.data)
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error fetching users',
        description: error.response?.data?.message || 'Failed to fetch users',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setLoading(false)
    }
  }

  const handleUserActionClick = (user) => {
    setSelectedUser(user)
    onUserModalOpen()
  }

  const handleCreditAdjustment = (user) => {
    setSelectedUser(user)
    onCreditModalOpen()
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus })
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, status: newStatus } : user
        )
      )
      
      const user = users.find(u => u._id === userId)
      
      toast({
        title: 'User status updated',
        description: `${user.username}'s status has been updated to ${newStatus}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: error.response?.data?.message || 'Failed to update user status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        )
      )
      
      const user = users.find(u => u._id === userId)
      
      toast({
        title: 'User role updated',
        description: `${user.username}'s role has been updated to ${newRole}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error updating role',
        description: error.response?.data?.message || 'Failed to update user role',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleCreditAdjustmentSubmit = async (amount, reason) => {
    try {
      const adjustedCredits = selectedUser.credits + parseInt(amount)
      
      await api.put(`/api/credits/${selectedUser._id}`, { 
        credits: adjustedCredits,
        reason
      })
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUser._id 
            ? { ...user, credits: adjustedCredits } 
            : user
        )
      )
      
      await refreshUser()
      
      toast({
        title: 'Credits adjusted',
        description: `${selectedUser.username}'s credits have been ${amount >= 0 ? 'increased' : 'decreased'} by ${Math.abs(amount)}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      onCreditModalClose()
    } catch (error) {
      toast({
        title: 'Error adjusting credits',
        description: error.response?.data?.message || 'Failed to adjust credits',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`)
      
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId))
      
      toast({
        title: 'User deleted',
        description: 'User has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error deleting user',
        description: error.response?.data?.message || 'Failed to delete user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleSort = (field) => {
    setSortOrder(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const filteredAndSortedUsers = () => {
    return users
      .filter(user => {
        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          if (
            !user.name.toLowerCase().includes(query) &&
            !user.email.toLowerCase().includes(query)
          ) {
            return false
          }
        }
        
        // Apply role filter
        if (roleFilter !== 'all' && user.role !== roleFilter) {
          return false
        }
        
        // Apply status filter
        if (statusFilter !== 'all' && user.status !== statusFilter) {
          return false
        }
        
        return true
      })
      .sort((a, b) => {
        const { field, direction } = sortOrder
        
        if (field === 'name') {
          return direction === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        }
        
        if (field === 'credits') {
          return direction === 'asc' 
            ? a.credits - b.credits
            : b.credits - a.credits
        }
        
        if (field === 'lastActive') {
          return direction === 'asc' 
            ? new Date(a.lastActive) - new Date(b.lastActive)
            : new Date(b.lastActive) - new Date(a.lastActive)
        }
        
        if (field === 'createdAt') {
          return direction === 'asc' 
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt)
        }
        
        return 0
      })
  }

  const UserModal = () => (
    <Modal isOpen={isUserModalOpen} onClose={onUserModalClose} size="xl">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader pb={1}>User Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedUser && (
            <Box>
              <Flex mb={6} direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'center' }} gap={4}>
                <Avatar 
                  size="xl" 
                  name={selectedUser.name} 
                  src={selectedUser.avatar}
                />
                <Box textAlign={{ base: 'center', md: 'left' }}>
                  <Heading size="md">{selectedUser.name}</Heading>
                  <Text color="neutral.600">{selectedUser.email}</Text>
                  <HStack mt={2} spacing={2}>
                    <Badge 
                      colorScheme={selectedUser.role === 'admin' ? 'purple' : 'blue'}
                      variant="subtle"
                      px={2}
                      py={1}
                    >
                      {selectedUser.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                    <Badge 
                      colorScheme={
                        selectedUser.status === 'active' 
                          ? 'green' 
                          : selectedUser.status === 'inactive' 
                            ? 'yellow' 
                            : 'red'
                      }
                      variant="subtle"
                      px={2}
                      py={1}
                    >
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                    </Badge>
                  </HStack>
                </Box>
                <Box ml={{ base: 0, md: 'auto' }}>
                  <Menu>
                    <MenuButton as={Button} rightIcon={<FiChevronDown />} colorScheme="primary" variant="outline" w={{ base: 'full', md: 'auto' }}>
                      Actions
                    </MenuButton>
                    <MenuList>
                      <MenuItem icon={<FiEdit />}>Edit User</MenuItem>
                      <MenuItem 
                        icon={<FiCreditCard />}
                        onClick={() => handleCreditAdjustment(selectedUser)}
                      >
                        Adjust Credits
                      </MenuItem>
                      {selectedUser.status !== 'active' && (
                        <MenuItem 
                          icon={<FiUserCheck />}
                          onClick={() => handleStatusChange(selectedUser._id, 'active')}
                        >
                          Activate User
                        </MenuItem>
                      )}
                      {selectedUser.status !== 'inactive' && (
                        <MenuItem 
                          icon={<FiUserX />}
                          onClick={() => handleStatusChange(selectedUser._id, 'inactive')}
                        >
                          Deactivate User
                        </MenuItem>
                      )}
                      {selectedUser.status !== 'suspended' && (
                        <MenuItem 
                          icon={<FiUserX />}
                          onClick={() => handleStatusChange(selectedUser._id, 'suspended')}
                          color="red.500"
                        >
                          Suspend User
                        </MenuItem>
                      )}
                      {selectedUser.role === 'user' && (
                        <MenuItem 
                          icon={<FiUserPlus />}
                          onClick={() => handleRoleChange(selectedUser._id, 'admin')}
                        >
                          Make Admin
                        </MenuItem>
                      )}
                      {selectedUser.role === 'admin' && (
                        <MenuItem 
                          icon={<FiUser />}
                          onClick={() => handleRoleChange(selectedUser._id, 'user')}
                        >
                          Remove Admin
                        </MenuItem>
                      )}
                    </MenuList>
                  </Menu>
                </Box>
              </Flex>

              <Tabs variant="enclosed" colorScheme="primary" mb={4}>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Activity</Tab>
                  <Tab>Settings</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mb={4}>
                      <GridItem>
                        <Stat bg="neutral.50" p={4} borderRadius="md">
                          <StatLabel>Credits</StatLabel>
                          <StatNumber>{selectedUser.credits}</StatNumber>
                          <Button 
                            size="xs" 
                            colorScheme="primary" 
                            variant="link" 
                            onClick={() => handleCreditAdjustment(selectedUser)}
                            mt={1}
                          >
                            Adjust
                          </Button>
                        </Stat>
                      </GridItem>
                      <GridItem>
                        <Stat bg="neutral.50" p={4} borderRadius="md">
                          <StatLabel>Member Since</StatLabel>
                          <StatNumber fontSize="lg">
                            {format(selectedUser.createdAt, 'MMM d, yyyy')}
                          </StatNumber>
                          <StatHelpText>
                            {Math.floor((new Date() - new Date(selectedUser.createdAt)) / (1000 * 60 * 60 * 24))} days
                          </StatHelpText>
                        </Stat>
                      </GridItem>
                      <GridItem>
                        <Stat bg="neutral.50" p={4} borderRadius="md">
                          <StatLabel>Last Active</StatLabel>
                          <StatNumber fontSize="lg">
                            {format(selectedUser.lastActive, 'MMM d, h:mm a')}
                          </StatNumber>
                          <StatHelpText>
                            {new Date(selectedUser.lastActive) > new Date(Date.now() - 86400000) 
                              ? 'Today' 
                              : new Date(selectedUser.lastActive) > new Date(Date.now() - 86400000 * 2)
                                ? 'Yesterday'
                                : `${Math.floor((new Date() - new Date(selectedUser.lastActive)) / (1000 * 60 * 60 * 24))} days ago`}
                          </StatHelpText>
                        </Stat>
                      </GridItem>
                      <GridItem>
                        <Stat bg="neutral.50" p={4} borderRadius="md">
                          <StatLabel>Profile Completion</StatLabel>
                          <HStack>
                            <StatNumber fontSize="lg">
                              {selectedUser.profileCompletion}%
                            </StatNumber>
                            <Progress 
                              value={selectedUser.profileCompletion} 
                              colorScheme={
                                selectedUser.profileCompletion < 50 
                                  ? 'red' 
                                  : selectedUser.profileCompletion < 80 
                                    ? 'yellow' 
                                    : 'green'
                              }
                              flex={1}
                              size="sm"
                              borderRadius="full"
                            />
                          </HStack>
                        </Stat>
                      </GridItem>
                    </Grid>

                    <Box mb={4}>
                      <Heading size="xs" mb={2}>Bio</Heading>
                      <Box bg="neutral.50" p={4} borderRadius="md">
                        <Text>{selectedUser.bio || 'No bio provided.'}</Text>
                      </Box>
                    </Box>

                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <GridItem>
                        <Stat bg="neutral.50" p={4} borderRadius="md">
                          <StatLabel>Saved Posts</StatLabel>
                          <StatNumber>{selectedUser.savedPosts}</StatNumber>
                        </Stat>
                      </GridItem>
                      <GridItem>
                        <Stat bg="neutral.50" p={4} borderRadius="md">
                          <StatLabel>Shared Posts</StatLabel>
                          <StatNumber>{selectedUser.sharedPosts}</StatNumber>
                        </Stat>
                      </GridItem>
                    </Grid>
                  </TabPanel>
                  <TabPanel px={0}>
                    <Text color="neutral.600" py={4}>
                      Activity log functionality would appear here in a real application, showing login history, 
                      interactions with content, and credit transactions.
                    </Text>
                  </TabPanel>
                  <TabPanel px={0}>
                    <Text color="neutral.600" py={4}>
                      User settings and permissions management would appear here in a real application, 
                      allowing admins to adjust notification preferences, privacy settings, and access controls.
                    </Text>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onUserModalClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )

  const CreditModal = () => {
    const [amount, setAmount] = useState(0)
    const [reason, setReason] = useState('')
    
    return (
      <Modal isOpen={isCreditModalOpen} onClose={onCreditModalClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader>Adjust Credits</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack align="stretch" spacing={4}>
                <Flex align="center">
                  <Avatar 
                    size="sm" 
                    name={selectedUser.name} 
                    src={selectedUser.avatar}
                    mr={3}
                  />
                  <Box>
                    <Text fontWeight="medium">{selectedUser.name}</Text>
                    <Text fontSize="sm" color="neutral.600">Current Credits: {selectedUser.credits}</Text>
                  </Box>
                </Flex>
                
                <FormControl>
                  <FormLabel>Credit Adjustment</FormLabel>
                  <NumberInput 
                    defaultValue={0} 
                    onChange={(_, value) => setAmount(value)}
                    min={-selectedUser.credits}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="sm" color="neutral.600" mt={1}>
                    {amount > 0 ? `Add ${amount} credits` : amount < 0 ? `Remove ${Math.abs(amount)} credits` : 'No change'}
                  </Text>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Reason (optional)</FormLabel>
                  <Input 
                    placeholder="Reason for adjustment"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </FormControl>
                
                <Box bg="neutral.50" p={3} borderRadius="md">
                  <Text fontWeight="medium">New Credit Balance</Text>
                  <Text fontSize="xl" fontWeight="bold" color={amount >= 0 ? 'green.500' : 'red.500'}>
                    {selectedUser.credits + parseInt(amount || 0)}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onCreditModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme={amount >= 0 ? 'green' : 'red'}
              onClick={() => handleCreditAdjustmentSubmit(amount, reason)}
            >
              {amount >= 0 ? 'Add Credits' : 'Remove Credits'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Box>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'stretch', md: 'center' }}
          mb={6} 
          gap={4}
        >
          <Box>
            <Heading size="lg">User Management</Heading>
            <Text color="neutral.600" mt={1}>
              Manage users, roles, and credits
            </Text>
          </Box>
          
          <HStack spacing={4}>
            <Button leftIcon={<FiUserPlus />} colorScheme="primary">
              Add User
            </Button>
          </HStack>
        </Flex>

        <Card mb={8} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify="space-between" 
              align={{ base: 'stretch', md: 'center' }}
              gap={4}
              mb={4}
            >
              <InputGroup maxW={{ base: '100%', md: '320px' }}>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="var(--color-neutral-400)" />
                </InputLeftElement>
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              
              <HStack spacing={4}>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  maxW={{ base: '100%', md: '140px' }}
                  placeholder="Role"
                  icon={<FiFilter />}
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Select>
                
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  maxW={{ base: '100%', md: '140px' }}
                  placeholder="Status"
                  icon={<FiFilter />}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </HStack>
            </Flex>
            
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('name')}
                      position="relative"
                      pl={3}
                    >
                      User
                      {sortOrder.field === 'name' && (
                        <Box as="span" ml={1} position="absolute">
                          {sortOrder.direction === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                        </Box>
                      )}
                    </Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('credits')}
                      position="relative"
                    >
                      Credits
                      {sortOrder.field === 'credits' && (
                        <Box as="span" ml={1} position="absolute">
                          {sortOrder.direction === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                        </Box>
                      )}
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('lastActive')}
                      position="relative"
                    >
                      Last Active
                      {sortOrder.field === 'lastActive' && (
                        <Box as="span" ml={1} position="absolute">
                          {sortOrder.direction === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                        </Box>
                      )}
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('createdAt')}
                      position="relative"
                    >
                      Created
                      {sortOrder.field === 'createdAt' && (
                        <Box as="span" ml={1} position="absolute">
                          {sortOrder.direction === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                        </Box>
                      )}
                    </Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    // Loading state
                    [...Array(5)].map((_, index) => (
                      <Tr key={index}>
                        <Td>
                          <Flex align="center">
                            <Box w="40px" h="40px" borderRadius="full" bg="neutral.100" mr={3} />
                            <Box>
                              <Box w="120px" h="12px" mb={1} bg="neutral.100" borderRadius="full" />
                              <Box w="80px" h="8px" bg="neutral.100" borderRadius="full" />
                            </Box>
                          </Flex>
                        </Td>
                        <Td><Box w="60px" h="8px" bg="neutral.100" borderRadius="full" /></Td>
                        <Td><Box w="60px" h="8px" bg="neutral.100" borderRadius="full" /></Td>
                        <Td><Box w="40px" h="8px" bg="neutral.100" borderRadius="full" /></Td>
                        <Td><Box w="80px" h="8px" bg="neutral.100" borderRadius="full" /></Td>
                        <Td><Box w="80px" h="8px" bg="neutral.100" borderRadius="full" /></Td>
                        <Td><Box w="40px" h="20px" bg="neutral.100" borderRadius="md" /></Td>
                      </Tr>
                    ))
                  ) : filteredAndSortedUsers().length === 0 ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={8}>
                        <Box>
                          <FiUser size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                          <Text fontWeight="medium" mb={1}>No users found</Text>
                          <Text fontSize="sm" color="neutral.600">
                            Try adjusting your search or filters
                          </Text>
                        </Box>
                      </Td>
                    </Tr>
                  ) : (
                    filteredAndSortedUsers().map((user) => (
                      <Tr key={user._id}>
                        <Td>
                          <Flex align="center">
                            <Avatar
                              size="md"
                              name={user.name}
                              src={user.avatar}
                              mr={3}
                            />
                            <Box>
                              <Text fontWeight="medium">{user.name}</Text>
                              <Text fontSize="sm" color="neutral.500">{user.email}</Text>
                            </Box>
                          </Flex>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={user.role === 'admin' ? 'purple' : 'blue'}
                            variant="subtle"
                          >
                            {user.role}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              user.status === 'active' 
                                ? 'green' 
                                : user.status === 'inactive' 
                                  ? 'yellow' 
                                  : 'red'
                            }
                          >
                            {user.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Flex align="center">
                            <Text fontWeight="medium">{user.credits}</Text>
                            <Tooltip label="Adjust Credits">
                              <IconButton
                                aria-label="Adjust credits"
                                icon={<FiEdit2 size={14} />}
                                size="xs"
                                variant="ghost"
                                ml={2}
                                onClick={() => handleCreditAdjustment(user)}
                              />
                            </Tooltip>
                          </Flex>
                        </Td>
                        <Td>
                          <Flex align="center">
                            <FiClock size={14} style={{ marginRight: '6px', opacity: 0.5 }} />
                            <Text fontSize="sm">
                              {new Date(user.lastActive) > new Date(Date.now() - 86400000) 
                                ? format(user.lastActive, 'h:mm a')
                                : format(user.lastActive, 'MMM d')}
                            </Text>
                          </Flex>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {format(user.createdAt, 'MMM d, yyyy')}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="View Details">
                              <IconButton
                                aria-label="View user details"
                                icon={<FiEdit2 />}
                                variant="ghost"
                                colorScheme="primary"
                                size="sm"
                                onClick={() => handleUserActionClick(user)}
                              />
                            </Tooltip>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="More options"
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem icon={<FiCreditCard />} onClick={() => handleCreditAdjustment(user)}>
                                  Adjust Credits
                                </MenuItem>
                                {user.status !== 'active' && (
                                  <MenuItem icon={<FiUserCheck />} onClick={() => handleStatusChange(user._id, 'active')}>
                                    Activate User
                                  </MenuItem>
                                )}
                                {user.status !== 'inactive' && (
                                  <MenuItem icon={<FiUserX />} onClick={() => handleStatusChange(user._id, 'inactive')}>
                                    Deactivate User
                                  </MenuItem>
                                )}
                                {user.status !== 'suspended' && (
                                  <MenuItem icon={<FiUserX />} onClick={() => handleStatusChange(user._id, 'suspended')} color="red.500">
                                    Suspend User
                                  </MenuItem>
                                )}
                                {user.role === 'user' && (
                                  <MenuItem icon={<FiUserPlus />} onClick={() => handleRoleChange(user._id, 'admin')}>
                                    Make Admin
                                  </MenuItem>
                                )}
                                {user.role === 'admin' && (
                                  <MenuItem icon={<FiUser />} onClick={() => handleRoleChange(user._id, 'user')}>
                                    Remove Admin
                                  </MenuItem>
                                )}
                                <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => handleDeleteUser(user._id)}>
                                  Delete User
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </MotionBox>
      
      <UserModal />
      <CreditModal />
    </Box>
  )
}

export default UserManagement