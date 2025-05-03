import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
  HStack,
  Avatar,
  Badge,
  Progress,
  useToast,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  Select,
  FormHelperText,
  Icon
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiEdit2, FiCheckCircle, FiUser, FiSettings, FiBell, FiLock, FiCamera } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

const MotionBox = motion(Box)
const MotionCard = motion(Card)

const Profile = () => {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || '',
    profession: user?.profile?.profession || '',
    website: user?.profile?.socialLinks?.website || '',
    twitter: user?.profile?.socialLinks?.twitter || '',
    instagram: user?.profile?.socialLinks?.instagram || ''
  })

  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.username || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        profession: user.profile?.profession || '',
        website: user.profile?.socialLinks?.website || '',
        twitter: user.profile?.socialLinks?.twitter || '',
        instagram: user.profile?.socialLinks?.instagram || ''
      })
    }
  }, [user])

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newsletterSubscription: false,
    creditAlerts: true,
    contentSuggestions: true
  })
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    activityVisibility: 'followers',
    allowTagging: true,
    showCredits: true
  })

  const calculateProfileCompletion = () => {
    const fields = {
      name: Boolean(profileData.name),
      email: Boolean(profileData.email),
      bio: Boolean(profileData.bio),
      avatar: Boolean(user?.profile?.avatar && !user.profile.avatar.includes('ui-avatars.com')),
      location: Boolean(profileData.location),
      profession: Boolean(profileData.profession),
      socialLinks: Boolean(profileData.twitter || profileData.instagram || profileData.website)
    };

    const completed = Object.values(fields).filter(Boolean).length;
    const total = Object.keys(fields).length;
    
    return {
      percentage: Math.round((completed / total) * 100),
      fields,
      rewards: {
        bio: 5,
        avatar: 10,
        location: 3,
        profession: 5,
        socialLinks: 7
      },
      remainingRewards: Object.entries(fields)
        .filter(([key, completed]) => !completed && key !== 'name' && key !== 'email')
        .reduce((acc, [key]) => acc + {
          bio: 5,
          avatar: 10,
          location: 3,
          profession: 5,
          socialLinks: 7
        }[key] || 0, 0)
    };
  };

  const profileStats = calculateProfileCompletion();

  const avatarInputRef = useRef(null)
  const toast = useToast()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked
    }))
  }

  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target
    setPrivacySettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      const response = await api.put('/users/profile', {
        username: profileData.name,
        email: profileData.email,
        profile: {
          bio: profileData.bio,
          location: profileData.location,
          profession: profileData.profession,
          socialLinks: {
            website: profileData.website,
            twitter: profileData.twitter,
            instagram: profileData.instagram
          }
        }
      });

      // Update both local and global state
      const updatedUser = response.data.user;
      
      // Update global auth context
      await refreshUser();

      // Update local state to match server response
      setProfileData({
        name: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.profile?.bio || '',
        location: updatedUser.profile?.location || '',
        profession: updatedUser.profile?.profession || '',
        website: updatedUser.profile?.socialLinks?.website || '',
        twitter: updatedUser.profile?.socialLinks?.twitter || '',
        instagram: updatedUser.profile?.socialLinks?.instagram || ''
      });

      setIsEditing(false);

      if (response.data.creditsEarned) {
        toast({
          title: 'Profile Updated & Credits Earned!',
          description: `You earned ${response.data.creditsEarned} credits for completing: ${response.data.updatedFields.join(', ')}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right'
        });
      } else {
        toast({
          title: 'Profile Updated',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (type) => {
    toast({
      title: `${type} settings updated`,
      description: `Your ${type.toLowerCase()} settings have been updated successfully.`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleAvatarClick = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.put('/users/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update global auth context
      await refreshUser();

      if (response.data.creditsEarned > 0) {
        toast({
          title: 'Profile Picture Updated & Credits Earned!',
          description: `You earned ${response.data.creditsEarned} credits for adding a profile picture`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Profile Picture Updated',
          description: 'Your profile picture has been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating profile picture',
        description: error.response?.data?.message || 'Failed to update profile picture',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          mb={6}
          gap={4}
        >
          <Box>
            <Heading size="lg">Profile Settings</Heading>
            <Text color="neutral.600" mt={1}>
              Manage your account and preferences
            </Text>
          </Box>
          {!isEditing && (
            <Button
              leftIcon={<FiEdit2 />}
              colorScheme="primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Flex>

        <Tabs 
          variant="soft-rounded" 
          colorScheme="primary"
          isLazy
        >
          <TabList mb={6} overflowX="auto" py={2} css={{ scrollbarWidth: 'none' }}>
            <Tab><Icon as={FiUser} mr={2} /> Profile</Tab>
            <Tab><Icon as={FiBell} mr={2} /> Notifications</Tab>
            <Tab><Icon as={FiLock} mr={2} /> Privacy</Tab>
            <Tab><Icon as={FiSettings} mr={2} /> Preferences</Tab>
          </TabList>

          <TabPanels>
            {/* Profile Tab */}
            <TabPanel px={0}>
              <Grid 
                templateColumns={{ base: '1fr', lg: '3fr 2fr' }}
                gap={6}
              >
                <GridItem>
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    borderRadius="lg"
                    boxShadow="md"
                  >
                    <CardHeader pb={0}>
                      <Heading size="md">Personal Information</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Full Name</FormLabel>
                          <Input
                            name="name"
                            value={profileData.name}
                            onChange={handleInputChange}
                            isDisabled={!isEditing}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Input
                            name="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            isDisabled={!isEditing}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Bio</FormLabel>
                          <Textarea
                            name="bio"
                            value={profileData.bio}
                            onChange={handleInputChange}
                            isDisabled={!isEditing}
                            resize="vertical"
                            minH="100px"
                          />
                        </FormControl>

                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                          <FormControl>
                            <FormLabel>Location</FormLabel>
                            <Input
                              name="location"
                              value={profileData.location}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Profession</FormLabel>
                            <Input
                              name="profession"
                              value={profileData.profession}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                            />
                          </FormControl>
                        </Grid>

                        <Divider my={2} />
                        <Heading size="sm" mb={2}>Social Profiles</Heading>

                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                          <FormControl>
                            <FormLabel>Website</FormLabel>
                            <Input
                              name="website"
                              value={profileData.website}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Twitter</FormLabel>
                            <Input
                              name="twitter"
                              value={profileData.twitter}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                            />
                          </FormControl>
                        </Grid>

                        <FormControl>
                          <FormLabel>Instagram</FormLabel>
                          <Input
                            name="instagram"
                            value={profileData.instagram}
                            onChange={handleInputChange}
                            isDisabled={!isEditing}
                          />
                        </FormControl>

                        {isEditing && (
                          <HStack justify="flex-end" pt={4}>
                            <Button
                              variant="outline"
                              mr={3}
                              onClick={() => setIsEditing(false)}
                              isDisabled={loading}
                            >
                              Cancel
                            </Button>
                            <Button
                              colorScheme="primary"
                              leftIcon={<FiCheckCircle />}
                              onClick={handleSaveProfile}
                              isLoading={loading}
                              loadingText="Saving..."
                            >
                              Save Changes
                            </Button>
                          </HStack>
                        )}
                      </VStack>
                    </CardBody>
                  </MotionCard>
                </GridItem>

                <GridItem>
                  <VStack spacing={6} align="stretch">
                    <MotionCard
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      borderRadius="lg"
                      boxShadow="md"
                    >
                      <CardBody>
                        <VStack spacing={4} align="center">
                          <Box position="relative">
                            <Avatar 
                              size="2xl" 
                              name={profileData.name} 
                              src={user?.avatar}
                              border="4px solid white"
                              boxShadow="md"
                            />
                            <Input
                              type="file"
                              accept="image/*"
                              ref={avatarInputRef}
                              display="none"
                              onChange={handleAvatarChange}
                            />
                            <IconButton
                              aria-label="Change profile picture"
                              icon={<FiCamera />}
                              isRound
                              size="sm"
                              position="absolute"
                              bottom="3px"
                              right="3px"
                              onClick={handleAvatarClick}
                              bg="primary.500"
                              color="white"
                              _hover={{ bg: 'primary.600' }}
                            />
                          </Box>
                          <VStack spacing={1}>
                            <Heading size="md">{profileData.name}</Heading>
                            <Text color="neutral.600">{profileData.profession}</Text>
                            <Badge colorScheme="green">Creator</Badge>
                          </VStack>
                          <HStack>
                            <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={1}>
                              {user?.credits || 120} Credits
                            </Badge>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </MotionCard>

                    <MotionCard>
                      <CardHeader pb={0}>
                        <Heading size="md">Profile Completion</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Flex justify="space-between" align="center">
                            <Text fontWeight="medium">
                              {profileStats.percentage}% Complete
                            </Text>
                            <Text 
                              fontSize="sm" 
                              color={profileStats.percentage === 100 ? 'green.500' : 'neutral.500'}
                            >
                              {profileStats.percentage === 100 ? (
                                <Box as="span" display="flex" alignItems="center">
                                  <FiCheckCircle style={{ marginRight: '4px' }} />
                                  Complete
                                </Box>
                              ) : (
                                `${profileStats.remainingRewards} credits available`
                              )}
                            </Text>
                          </Flex>
                          
                          <Progress
                            value={profileStats.percentage}
                            size="sm"
                            colorScheme={profileStats.percentage === 100 ? 'green' : 'blue'}
                            borderRadius="full"
                          />
                          
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                              <HStack>
                                <Icon 
                                  as={FiCheckCircle} 
                                  color={profileStats.fields.name ? "green.500" : "neutral.300"} 
                                />
                                <Text fontSize="sm">Name</Text>
                              </HStack>
                              <Badge colorScheme="green">Required</Badge>
                            </HStack>

                            <HStack justify="space-between">
                              <HStack>
                                <Icon 
                                  as={FiCheckCircle} 
                                  color={profileStats.fields.email ? "green.500" : "neutral.300"} 
                                />
                                <Text fontSize="sm">Email</Text>
                              </HStack>
                              <Badge colorScheme="green">Required</Badge>
                            </HStack>

                            <HStack justify="space-between">
                              <HStack>
                                <Icon 
                                  as={FiCheckCircle} 
                                  color={profileStats.fields.bio ? "green.500" : "neutral.300"} 
                                />
                                <Text fontSize="sm">Bio</Text>
                              </HStack>
                              <Badge colorScheme={profileStats.fields.bio ? "green" : "blue"}>
                                {profileStats.fields.bio ? 'Complete' : '+5 credits'}
                              </Badge>
                            </HStack>

                            <HStack justify="space-between">
                              <HStack>
                                <Icon 
                                  as={FiCheckCircle} 
                                  color={profileStats.fields.avatar ? "green.500" : "neutral.300"} 
                                />
                                <Text fontSize="sm">Profile Picture</Text>
                              </HStack>
                              <Badge colorScheme={profileStats.fields.avatar ? "green" : "blue"}>
                                {profileStats.fields.avatar ? 'Complete' : '+10 credits'}
                              </Badge>
                            </HStack>

                            <HStack justify="space-between">
                              <HStack>
                                <Icon 
                                  as={FiCheckCircle} 
                                  color={profileStats.fields.location ? "green.500" : "neutral.300"} 
                                />
                                <Text fontSize="sm">Location</Text>
                              </HStack>
                              <Badge colorScheme={profileStats.fields.location ? "green" : "blue"}>
                                {profileStats.fields.location ? 'Complete' : '+3 credits'}
                              </Badge>
                            </HStack>

                            <HStack justify="space-between">
                              <HStack>
                                <Icon 
                                  as={FiCheckCircle} 
                                  color={profileStats.fields.profession ? "green.500" : "neutral.300"} 
                                />
                                <Text fontSize="sm">Profession</Text>
                              </HStack>
                              <Badge colorScheme={profileStats.fields.profession ? "green" : "blue"}>
                                {profileStats.fields.profession ? 'Complete' : '+5 credits'}
                              </Badge>
                            </HStack>

                            <HStack justify="space-between">
                              <HStack>
                                <Icon 
                                  as={FiCheckCircle} 
                                  color={profileStats.fields.socialLinks ? "green.500" : "neutral.300"} 
                                />
                                <Text fontSize="sm">Social Links</Text>
                              </HStack>
                              <Badge colorScheme={profileStats.fields.socialLinks ? "green" : "blue"}>
                                {profileStats.fields.socialLinks ? 'Complete' : '+7 credits'}
                              </Badge>
                            </HStack>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </MotionCard>
                  </VStack>
                </GridItem>
              </Grid>
            </TabPanel>

            {/* Notifications Tab */}
            <TabPanel px={0}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                borderRadius="lg"
                boxShadow="md"
              >
                <CardHeader pb={0}>
                  <Heading size="md">Notification Preferences</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <FormLabel htmlFor="emailNotifications" mb={0}>
                          Email Notifications
                        </FormLabel>
                        <FormHelperText mt={0}>
                          Receive notifications via email
                        </FormHelperText>
                      </Box>
                      <Switch
                        id="emailNotifications"
                        name="emailNotifications"
                        isChecked={notificationSettings.emailNotifications}
                        onChange={handleNotificationChange}
                        colorScheme="primary"
                      />
                    </FormControl>
                    
                    <Divider />
                    
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <FormLabel htmlFor="pushNotifications" mb={0}>
                          Push Notifications
                        </FormLabel>
                        <FormHelperText mt={0}>
                          Receive notifications in your browser
                        </FormHelperText>
                      </Box>
                      <Switch
                        id="pushNotifications"
                        name="pushNotifications"
                        isChecked={notificationSettings.pushNotifications}
                        onChange={handleNotificationChange}
                        colorScheme="primary"
                      />
                    </FormControl>
                    
                    <Divider />
                    
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <FormLabel htmlFor="newsletterSubscription" mb={0}>
                          Weekly Newsletter
                        </FormLabel>
                        <FormHelperText mt={0}>
                          Receive weekly updates and tips
                        </FormHelperText>
                      </Box>
                      <Switch
                        id="newsletterSubscription"
                        name="newsletterSubscription"
                        isChecked={notificationSettings.newsletterSubscription}
                        onChange={handleNotificationChange}
                        colorScheme="primary"
                      />
                    </FormControl>
                    
                    <Divider />
                    
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <FormLabel htmlFor="creditAlerts" mb={0}>
                          Credit Alerts
                        </FormLabel>
                        <FormHelperText mt={0}>
                          Receive notifications about credit changes
                        </FormHelperText>
                      </Box>
                      <Switch
                        id="creditAlerts"
                        name="creditAlerts"
                        isChecked={notificationSettings.creditAlerts}
                        onChange={handleNotificationChange}
                        colorScheme="primary"
                      />
                    </FormControl>
                    
                    <Divider />
                    
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <FormLabel htmlFor="contentSuggestions" mb={0}>
                          Content Suggestions
                        </FormLabel>
                        <FormHelperText mt={0}>
                          Receive personalized content recommendations
                        </FormHelperText>
                      </Box>
                      <Switch
                        id="contentSuggestions"
                        name="contentSuggestions"
                        isChecked={notificationSettings.contentSuggestions}
                        onChange={handleNotificationChange}
                        colorScheme="primary"
                      />
                    </FormControl>
                    
                    <Divider />
                    
                    <Box pt={4}>
                      <Button
                        colorScheme="primary"
                        onClick={() => handleSaveSettings('Notification')}
                      >
                        Save Notification Settings
                      </Button>
                    </Box>
                  </VStack>
                </CardBody>
              </MotionCard>
            </TabPanel>

            {/* Privacy Tab */}
            <TabPanel px={0}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                borderRadius="lg"
                boxShadow="md"
              >
                <CardHeader pb={0}>
                  <Heading size="md">Privacy Settings</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel htmlFor="profileVisibility">
                        Profile Visibility
                      </FormLabel>
                      <Select
                        id="profileVisibility"
                        name="profileVisibility"
                        value={privacySettings.profileVisibility}
                        onChange={handlePrivacyChange}
                      >
                        <option value="public">Public - Anyone can view your profile</option>
                        <option value="followers">Followers Only - Only followers can view your profile</option>
                        <option value="private">Private - Only you can view your profile</option>
                      </Select>
                      <FormHelperText>
                        Control who can see your profile details
                      </FormHelperText>
                    </FormControl>
                    
                    <Divider />
                    
                    <FormControl>
                      <FormLabel htmlFor="activityVisibility">
                        Activity Visibility
                      </FormLabel>
                      <Select
                        id="activityVisibility"
                        name="activityVisibility"
                        value={privacySettings.activityVisibility}
                        onChange={handlePrivacyChange}
                      >
                        <option value="public">Public - Anyone can see your activity</option>
                        <option value="followers">Followers Only - Only followers can see your activity</option>
                        <option value="private">Private - Only you can see your activity</option>
                      </Select>
                      <FormHelperText>
                        Control who can see your interactions with content
                      </FormHelperText>
                    </FormControl>
                    
                    <Divider />
                    
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <FormLabel htmlFor="allowTagging" mb={0}>
                          Allow Tagging
                        </FormLabel>
                        <FormHelperText mt={0}>
                          Allow other users to tag you in their content
                        </FormHelperText>
                      </Box>
                      <Switch
                        id="allowTagging"
                        name="allowTagging"
                        isChecked={privacySettings.allowTagging}
                        onChange={(e) => handlePrivacyChange({
                          target: {
                            name: 'allowTagging',
                            checked: e.target.checked,
                            type: 'checkbox'
                          }
                        })}
                        colorScheme="primary"
                      />
                    </FormControl>
                    
                    <Divider />
                    
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <FormLabel htmlFor="showCredits" mb={0}>
                          Show Credits
                        </FormLabel>
                        <FormHelperText mt={0}>
                          Show your credit balance on your public profile
                        </FormHelperText>
                      </Box>
                      <Switch
                        id="showCredits"
                        name="showCredits"
                        isChecked={privacySettings.showCredits}
                        onChange={(e) => handlePrivacyChange({
                          target: {
                            name: 'showCredits',
                            checked: e.target.checked,
                            type: 'checkbox'
                          }
                        })}
                        colorScheme="primary"
                      />
                    </FormControl>
                    
                    <Divider />
                    
                    <Box pt={4}>
                      <Button
                        colorScheme="primary"
                        onClick={() => handleSaveSettings('Privacy')}
                      >
                        Save Privacy Settings
                      </Button>
                    </Box>
                  </VStack>
                </CardBody>
              </MotionCard>
            </TabPanel>

            {/* Preferences Tab */}
            <TabPanel px={0}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    borderRadius="lg"
                    boxShadow="md"
                  >
                    <CardHeader pb={0}>
                      <Heading size="md">Content Preferences</Heading>
                    </CardHeader>
                    <CardBody>
                      <Text mb={4}>
                        Select the types of content you're interested in seeing in your feed.
                      </Text>
                      <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={4}>
                        {['Technology', 'Design', 'Programming', 'Business', 'Marketing', 'Science', 'Art', 'Music', 'Health'].map((category) => (
                          <FormControl key={category} display="flex" alignItems="center">
                            <Switch id={category} colorScheme="primary" defaultChecked={['Technology', 'Design', 'Programming'].includes(category)} mr={3} />
                            <FormLabel htmlFor={category} mb={0}>{category}</FormLabel>
                          </FormControl>
                        ))}
                      </Grid>
                    </CardBody>
                  </MotionCard>
                </GridItem>

                <GridItem>
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    borderRadius="lg"
                    boxShadow="md"
                    height="100%"
                  >
                    <CardHeader pb={0}>
                      <Heading size="md">Display Settings</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Theme</FormLabel>
                          <Select defaultValue="light">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System Default</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Feed Display</FormLabel>
                          <Select defaultValue="card">
                            <option value="card">Card View</option>
                            <option value="compact">Compact View</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center" justifyContent="space-between">
                          <FormLabel htmlFor="animations" mb={0}>
                            Enable Animations
                          </FormLabel>
                          <Switch id="animations" colorScheme="primary" defaultChecked />
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                </GridItem>

                <GridItem>
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    borderRadius="lg"
                    boxShadow="md"
                    height="100%"
                  >
                    <CardHeader pb={0}>
                      <Heading size="md">Language & Region</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Language</FormLabel>
                          <Select defaultValue="en">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="zh">Chinese</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Time Zone</FormLabel>
                          <Select defaultValue="utc-8">
                            <option value="utc-8">Pacific Time (PT)</option>
                            <option value="utc-5">Eastern Time (ET)</option>
                            <option value="utc+0">Greenwich Mean Time (GMT)</option>
                            <option value="utc+1">Central European Time (CET)</option>
                            <option value="utc+8">China Standard Time (CST)</option>
                          </Select>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Box pt={4} display="flex" justifyContent="flex-end">
                    <Button
                      colorScheme="primary"
                      size="lg"
                      onClick={() => handleSaveSettings('Preference')}
                    >
                      Save All Preferences
                    </Button>
                  </Box>
                </GridItem>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </MotionBox>
    </Box>
  )
}

export default Profile