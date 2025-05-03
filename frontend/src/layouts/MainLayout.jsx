import React from 'react'
import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Avatar,
  Text,
  HStack,
  VStack,
  Badge,
  Divider,
  useMediaQuery,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider
} from '@chakra-ui/react'
import { FiMenu, FiHome, FiCompass, FiUser, FiBookmark, FiSettings, FiLogOut, FiChevronDown, FiBell } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const MotionBox = motion(Box)

const MainLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  const handleScroll = () => {
    setScrolled(window.scrollY > 10)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    { name: 'Dashboard', icon: <FiHome size={20} />, path: '/dashboard' },
    { name: 'Feed', icon: <FiCompass size={20} />, path: '/feed' },
    { name: 'Profile', icon: <FiUser size={20} />, path: '/profile' },
    { name: 'Saved Content', icon: <FiBookmark size={20} />, path: '/saved' },
  ]

  const adminMenuItems = [
    { name: 'Admin Dashboard', icon: <FiSettings size={20} />, path: '/admin/dashboard' },
    { name: 'User Management', icon: <FiUser size={20} />, path: '/admin/users' },
    { name: 'Content Management', icon: <FiCompass size={20} />, path: '/admin/content' },
  ]

  const getActiveMenuStyles = (path) => {
    return location.pathname === path
      ? {
          bg: 'primary.50',
          color: 'primary.600',
          fontWeight: '600',
          borderRight: '3px solid',
          borderColor: 'primary.500'
        }
      : {}
  }

  const renderSidebar = () => (
    <VStack spacing={4} align="stretch">
      <Flex justifyContent="center" my={6}>
        <Box as="h1" fontSize="2xl" fontWeight="bold" color="primary.600">
          CreatorHub
        </Box>
      </Flex>

      <Flex px={4} alignItems="center" mb={6}>
        <Avatar size="md" name={user?.name} src={user?.avatar} />
        <Box ml={3}>
          <Text fontWeight="medium">{user?.name}</Text>
          <HStack spacing={2} mt={1}>
            <Badge colorScheme="blue" variant="solid" borderRadius="full" px={2}>
              {user?.credits || 0} Credits
            </Badge>
            <Badge
              colorScheme={isAdmin ? 'purple' : 'green'}
              variant="outline"
              borderRadius="full"
              px={2}
            >
              {isAdmin ? 'Admin' : 'Creator'}
            </Badge>
          </HStack>
        </Box>
      </Flex>

      <Divider />

      <Box as="nav">
        <VStack spacing={1} align="stretch">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              justifyContent="flex-start"
              pl={4}
              py={3}
              leftIcon={item.icon}
              onClick={() => {
                navigate(item.path)
                if (!isLargerThan768) onClose()
              }}
              _hover={{ bg: 'primary.50' }}
              {...getActiveMenuStyles(item.path)}
            >
              {item.name}
            </Button>
          ))}
        </VStack>

        {isAdmin && (
          <>
            <Divider my={4} />
            <Text px={4} fontWeight="medium" color="neutral.500" mb={2}>
              Admin
            </Text>
            <VStack spacing={1} align="stretch">
              {adminMenuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  justifyContent="flex-start"
                  pl={4}
                  py={3}
                  leftIcon={item.icon}
                  onClick={() => {
                    navigate(item.path)
                    if (!isLargerThan768) onClose()
                  }}
                  _hover={{ bg: 'secondary.50' }}
                  {...getActiveMenuStyles(item.path)}
                >
                  {item.name}
                </Button>
              ))}
            </VStack>
          </>
        )}
      </Box>

      <Box flex="1" />

      <Box p={4}>
        <Button
          width="full"
          variant="ghost"
          colorScheme="red"
          leftIcon={<FiLogOut />}
          onClick={logout}
          justifyContent="flex-start"
        >
          Logout
        </Button>
      </Box>
    </VStack>
  )

  return (
    <Flex h="100vh">
      {/* Sidebar for desktop */}
      {isLargerThan768 && (
        <Box
          width="250px"
          bgColor="white"
          boxShadow="sm"
          position="fixed"
          top={0}
          left={0}
          h="100vh"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--color-neutral-300)',
            },
          }}
        >
          {renderSidebar()}
        </Box>
      )}

      {/* Main Content */}
      <Box
        flex={1}
        ml={isLargerThan768 ? '250px' : 0}
        position="relative"
        overflowY="auto"
        bg="neutral.50"
      >
        {/* Header */}
        <MotionBox
          position="sticky"
          top={0}
          zIndex={10}
          px={4}
          py={3}
          bg={scrolled ? 'white' : 'transparent'}
          boxShadow={scrolled ? 'sm' : 'none'}
          backdropFilter={scrolled ? 'blur(10px)' : 'none'}
          transition="all 0.2s"
        >
          <Flex justify="space-between" align="center">
            {!isLargerThan768 && (
              <IconButton
                aria-label="Open menu"
                icon={<FiMenu size={24} />}
                variant="ghost"
                onClick={onOpen}
              />
            )}

            <Box
              visibility={isLargerThan768 ? 'hidden' : 'visible'}
              fontSize="xl"
              fontWeight="bold"
              color="primary.600"
            >
              CreatorHub
            </Box>

            <HStack spacing={4}>
              <IconButton
                aria-label="Notifications"
                icon={<FiBell size={20} />}
                variant="ghost"
                position="relative"
              >
                <Box
                  position="absolute"
                  top="6px"
                  right="6px"
                  bg="accent.500"
                  borderRadius="full"
                  w="8px"
                  h="8px"
                />
              </IconButton>
              
              {!isLargerThan768 && (
                <Menu>
                  <MenuButton as={Button} variant="ghost" rightIcon={<FiChevronDown />} p={0}>
                    <Avatar size="sm" name={user?.name} src={user?.avatar} />
                  </MenuButton>
                  <MenuList>
                    <Box px={3} py={2}>
                      <Text fontWeight="medium">{user?.name}</Text>
                      <Text fontSize="sm" color="neutral.500">
                        {user?.credits || 0} Credits
                      </Text>
                    </Box>
                    <MenuDivider />
                    <MenuItem icon={<FiUser />} onClick={() => navigate('/profile')}>
                      Profile
                    </MenuItem>
                    <MenuItem icon={<FiBookmark />} onClick={() => navigate('/saved')}>
                      Saved Content
                    </MenuItem>
                    {isAdmin && (
                      <>
                        <MenuDivider />
                        <MenuItem icon={<FiSettings />} onClick={() => navigate('/admin/dashboard')}>
                          Admin Dashboard
                        </MenuItem>
                      </>
                    )}
                    <MenuDivider />
                    <MenuItem icon={<FiLogOut />} onClick={logout}>
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            </HStack>
          </Flex>
        </MotionBox>

        {/* Page Content */}
        <Box p={4}>
          <Outlet />
        </Box>
      </Box>

      {/* Mobile Drawer */}
      {!isLargerThan768 && (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader p={0} />
            <DrawerBody p={0}>{renderSidebar()}</DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </Flex>
  )
}

export default MainLayout