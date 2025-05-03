import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Flex,
  Heading,
  Text,
  Avatar,
  Badge,
  HStack,
  IconButton,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  useToast,
  VStack,
  Image,
  Divider,
  Spinner
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiSearch, FiBookmark, FiShare2, FiExternalLink, FiTrash2, FiHeart, FiMessageSquare } from 'react-icons/fi'
import { format } from 'date-fns'
import { useAuth } from '../hooks/useAuth'
import { savedPostService } from '../services/savedPostService'
import { SimpleGrid } from "@chakra-ui/react"
const MotionBox = motion(Box)
const MotionCard = motion(Card)

const SavedContent = () => {
  const [savedPosts, setSavedPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const { user } = useAuth()

  const fetchSavedPosts = useCallback(async () => {
    setLoading(true)
    try {
      const posts = await savedPostService.getSavedPosts()
      setSavedPosts(posts)
      setFilteredPosts(posts)
    } catch (error) {
      toast({
        title: 'Error fetching saved posts',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSavedPosts()
  }, [fetchSavedPosts])

  const handleDeletePost = async (postId) => {
    try {
      await savedPostService.deleteSavedPost(postId)
      await fetchSavedPosts()
      toast({
        title: 'Post removed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error removing post',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleShareContent = (permalink) => {
    navigator.clipboard.writeText(permalink)
    toast({
      title: 'Link copied',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  useEffect(() => {
    // Filter and sort items
    let result = [...savedPosts]
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        item => 
          item.title.toLowerCase().includes(query) || 
          item.subreddit.toLowerCase().includes(query)
      )
    }
    
    // Sort items
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_utc * 1000) - new Date(a.created_utc * 1000)
      } else if (sortBy === 'oldest') {
        return new Date(a.created_utc * 1000) - new Date(b.created_utc * 1000)
      } else if (sortBy === 'popularity') {
        const aPopularity = a.score || 0
        const bPopularity = b.score || 0
        return bPopularity - aPopularity
      }
      return 0
    })
    
    setFilteredPosts(result)
  }, [savedPosts, searchQuery, sortBy])

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
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'stretch', md: 'center' }}
          mb={6} 
          gap={4}
        >
          <Box>
            <Heading size="lg">Saved Content</Heading>
            <Text color="neutral.600" mt={1}>
              Access your saved content
            </Text>
          </Box>
          
          <HStack>
            <InputGroup maxW={{ base: '100%', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="var(--color-neutral-400)" />
              </InputLeftElement>
              <Input
                placeholder="Search saved posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
              />
            </InputGroup>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              maxW={{ base: '100%', md: '150px' }}
              bg="white"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popularity">Most Popular</option>
            </Select>
          </HStack>
        </Flex>

        {filteredPosts.length === 0 ? (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            p={8}
            bg="white"
            borderRadius="lg"
            boxShadow="md"
            textAlign="center"
          >
            <FiBookmark size={48} style={{ margin: '0 auto 16px' }} color="var(--color-neutral-400)" />
            <Heading size="md" mb={2}>No saved posts found</Heading>
            <Text color="neutral.600" mb={4}>
              {searchQuery ? 'Try a different search term' : 'Start saving posts from the feed'}
            </Text>
            <Button
              colorScheme="primary"
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery('')
                } else {
                  // Navigate to feed
                }
              }}
            >
              {searchQuery ? 'Clear Search' : 'Go to Feed'}
            </Button>
          </MotionBox>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredPosts.map((post) => (
              <MotionCard
                key={post.postId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
                _hover={{ boxShadow: 'lg', transform: 'translateY(-4px)' }}
              >
                <CardBody pb={post.thumbnail && post.thumbnail !== 'self' ? 2 : 4}>
                  <Flex mb={3} justify="space-between" align="center">
                    <HStack>
                      <Avatar size="sm" name={post.author} />
                      <Box>
                        <HStack>
                          <Text fontWeight="bold" fontSize="sm">
                            {post.author}
                          </Text>
                          <Badge colorScheme="blue">r/{post.subreddit}</Badge>
                        </HStack>
                        <Text fontSize="xs" color="neutral.500">
                          {post.title}
                        </Text>
                      </Box>
                    </HStack>
                  </Flex>
                  
                  {post.thumbnail && post.thumbnail !== 'self' && (
                    <Box 
                      borderRadius="md" 
                      overflow="hidden" 
                      mb={2}
                      maxH="200px"
                    >
                      <Image 
                        src={post.thumbnail} 
                        alt={post.title} 
                        objectFit="cover" 
                        w="100%"
                        h="100%"
                      />
                    </Box>
                  )}
                  
                  <Flex justify="space-between" mt={2}>
                    <HStack spacing={1}>
                      <Badge 
                        colorScheme="yellow"
                        variant="subtle"
                      >
                        {post.score}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="neutral.500">
                      {format(new Date(post.created_utc * 1000), 'MMM d, yyyy')}
                    </Text>
                  </Flex>
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
                        icon={<FiShare2 />}
                        aria-label="Share"
                        variant="ghost"
                        onClick={() => handleShareContent(post.permalink)}
                      />
                      <IconButton
                        icon={<FiExternalLink />}
                        aria-label="View on Reddit"
                        variant="ghost"
                        onClick={() => window.open(post.permalink, '_blank')}
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label="Remove"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeletePost(post.postId)}
                      />
                    </HStack>
                  </Flex>
                </CardFooter>
              </MotionCard>
            ))}
          </SimpleGrid>
        )}
      </MotionBox>
    </Box>
  )
}

export default SavedContent