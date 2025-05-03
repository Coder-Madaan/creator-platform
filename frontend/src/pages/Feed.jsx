import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Flex,
  Grid,
  Heading,
  Text,
  Avatar,
  Badge,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  VStack,
  Divider,
  Image,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiBookmark, FiShare2, FiFlag, FiHeart, FiMessageSquare, FiExternalLink, FiChevronDown } from 'react-icons/fi'
import { format } from 'date-fns'
import { redditService } from '../services/redditService'
import { savedPostService } from '../services/savedPostService'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'  // Add this import

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionCard = motion(Card)

const Feed = () => {
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [savedPosts, setSavedPosts] = useState([])
  const [reportDialog, setReportDialog] = useState({ isOpen: false, postId: null, postData: null });
  const toast = useToast()
  const { user } = useAuth()

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    try {
      const posts = await redditService.getPosts(filter)
      setFeed(posts)
    } catch (error) {
      toast({
        title: 'Error fetching feed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [filter, toast])

  const fetchSavedPosts = useCallback(async () => {
    try {
      const posts = await savedPostService.getSavedPosts();
      setSavedPosts(posts);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    }
  }, []);

  useEffect(() => {
    fetchFeed()
    fetchSavedPosts()
  }, [fetchFeed, fetchSavedPosts])

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredFeed = feed.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.subreddit.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSaveContent = async (post) => {
    try {
      const postData = {
        postId: post.id,
        title: post.title,
        author: post.author,
        subreddit: post.subreddit,
        score: post.score,
        url: post.url,
        created_utc: post.created_utc,
        permalink: post.permalink,
        thumbnail: post.thumbnail,
        num_comments: post.num_comments
      };

      await savedPostService.savePost(postData);
      await fetchSavedPosts();
      toast({
        title: 'Post saved',
        description: 'You earned 1 credit for saving content!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error saving post',
        description: error.response?.data?.message || 'Failed to save post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const isPostSaved = (postId) => {
    return savedPosts.some(post => post.postId === postId);
  };

  const handleShareContent = (id) => {
    // Implement share functionality
    toast({
      title: 'Share link copied',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  const handleReportContent = async (post) => {
    setReportDialog({ isOpen: true, postId: post.id, postData: post });
  }

  const submitReport = async (reason) => {
    try {
      const { postId, postData } = reportDialog;
      
      await api.post('/reported-posts', {
        postId: postData.id,
        userId: user._id,
        reason: reason,
        postData: {
          title: postData.title,
          author: postData.author,
          subreddit: postData.subreddit,
          score: postData.score,
          url: postData.url,
          created_utc: postData.created_utc,
          permalink: postData.permalink,
          thumbnail: postData.thumbnail,
          num_comments: postData.num_comments,
        }
      });
      
      toast({
        title: 'Content reported',
        description: 'Thank you for reporting. Our moderators will review it.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      setReportDialog({ isOpen: false, postId: null, postData: null });
    } catch (error) {
      toast({
        title: 'Error reporting content',
        description: error.response?.data?.message || 'Failed to report content',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    )
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Feed</Heading>
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </InputGroup>
          <Menu>
            <MenuButton as={Button} rightIcon={<FiChevronDown />}>
              Filter: {filter}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleFilterChange('all')}>All</MenuItem>
              <MenuItem onClick={() => handleFilterChange('programming')}>Programming</MenuItem>
              <MenuItem onClick={() => handleFilterChange('technology')}>Technology</MenuItem>
              <MenuItem onClick={() => handleFilterChange('news')}>News</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
        {filteredFeed.map((post) => (
          <MotionCard
            key={post.id}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack spacing={2}>
                  <Avatar size="sm" name={post.author} />
                  <Text fontWeight="bold">{post.author}</Text>
                  <Badge colorScheme="blue">r/{post.subreddit}</Badge>
                </HStack>
                <Heading size="md">{post.title}</Heading>
                {post.thumbnail && post.thumbnail !== 'self' && (
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    borderRadius="md"
                    maxH="200px"
                    objectFit="cover"
                  />
                )}
                <Text color="gray.600">
                  {format(new Date(post.created_utc * 1000), 'MMM d, yyyy')}
                </Text>
              </VStack>
            </CardBody>
            <Divider />
            <CardFooter>
              <Flex justify="space-between" w="100%">
                <HStack spacing={4}>
                  <IconButton
                    icon={<FiHeart />}
                    aria-label="Like"
                    variant="ghost"
                  />
                  <Text>{post.score}</Text>
                  <IconButton
                    icon={<FiMessageSquare />}
                    aria-label="Comments"
                    variant="ghost"
                  />
                  <Text>{post.num_comments}</Text>
                </HStack>
                <HStack spacing={2}>
                  <IconButton
                    icon={<FiBookmark />}
                    aria-label="Save"
                    variant="ghost"
                    colorScheme={isPostSaved(post.id) ? 'blue' : 'gray'}
                    onClick={() => handleSaveContent(post)}
                  />
                  <IconButton
                    icon={<FiShare2 />}
                    aria-label="Share"
                    variant="ghost"
                    onClick={() => handleShareContent(post.id)}
                  />
                  <IconButton
                    icon={<FiFlag />}
                    aria-label="Report"
                    variant="ghost"
                    onClick={() => handleReportContent(post)}
                  />
                  <IconButton
                    icon={<FiExternalLink />}
                    aria-label="View on Reddit"
                    variant="ghost"
                    onClick={() => window.open(post.permalink, '_blank')}
                  />
                </HStack>
              </Flex>
            </CardFooter>
          </MotionCard>
        ))}
      </Grid>

      <Modal isOpen={reportDialog.isOpen} onClose={() => setReportDialog({ isOpen: false, postId: null, postData: null })}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Report Content</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Why are you reporting this content?</Text>
              <Button w="full" onClick={() => submitReport('Spam')}>Spam</Button>
              <Button w="full" onClick={() => submitReport('Inappropriate content')}>Inappropriate Content</Button>
              <Button w="full" onClick={() => submitReport('Misleading information')}>Misleading Information</Button>
              <Button w="full" onClick={() => submitReport('Harassment')}>Harassment</Button>
              <Button w="full" onClick={() => submitReport('Other')}>Other</Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Feed