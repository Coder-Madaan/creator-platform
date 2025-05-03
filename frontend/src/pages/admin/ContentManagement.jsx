import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Flex,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  InputGroup,
  Input,
  InputLeftElement,
  Select,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Image,
  VStack,
  HStack,
  Divider,
  Avatar,
  Tag,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  Link,
  TableContainer,
  Skeleton
} from '@chakra-ui/react';
import { FiFilter, FiSearch, FiCheck, FiX, FiEye, FiAlertTriangle, FiMessageCircle, FiMoreVertical, FiExternalLink, FiFlag, FiCalendar, FiUser, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import api from '../../services/api';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const ContentManagement = () => {
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [adminResponse, setAdminResponse] = useState('');
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/reported-content');
      setContent(response.data);
      setFilteredContent(response.data);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch reported content',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters and sorting to content
    let result = [...content];
    
    // Filter by source
    if (sourceFilter !== 'all') {
      result = result.filter(item => item.source === sourceFilter);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.content?.text && item.content.text.toLowerCase().includes(query)) ||
        (item.author?.name && item.author.name.toLowerCase().includes(query)) ||
        (item.reportReason && item.reportReason.toLowerCase().includes(query))
      );
    }
    
    // Sort items
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'most_reports') {
        return (b.reports?.length || 0) - (a.reports?.length || 0);
      }
      return 0;
    });
    
    setFilteredContent(result);
  }, [content, sourceFilter, statusFilter, searchQuery, sortBy]);

  const handleStatusChange = async (contentId, newStatus) => {
    try {
      await api.put(`/admin/content/${contentId}`, { status: newStatus });
      toast({
        title: 'Success',
        description: `Content ${newStatus === 'active' ? 'approved' : 'removed'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchContent();
      
      if (isOpen) {
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update content status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'removed': return 'red';
      case 'reported': return 'yellow';
      case 'under_review': return 'blue';
      default: return 'gray';
    }
  };

  const getSourceBadgeColor = (source) => {
    switch (source) {
      case 'reddit': return 'orange';
      case 'twitter': return 'twitter';
      case 'website': return 'blue';
      default: return 'purple';
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem({
      ...item,
      content: {
        ...item.content,
        text: item.content?.text || 'No content text available',
        title: item.content?.title,
        author: item.content?.author,
        subreddit: item.content?.subreddit,
        thumbnail: item.content?.thumbnail,
        permalink: item.content?.permalink
      }
    });
    onOpen();
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM d, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Content Management</Heading>
        </Flex>
        <Card>
          <CardBody>
            <VStack spacing={4} align="center" justify="center" py={10}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text>Loading reported content...</Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  const availableSources = ['all', ...new Set(content.map(item => item.source))];

  return (
    <Box>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex 
          justify="space-between" 
          align={{ base: 'stretch', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          mb={6}
          gap={4}
        >
          <Box>
            <Heading size="lg">Reported Content</Heading>
            <Text color="neutral.600" mt={1}>
              Review and manage content flagged by users
            </Text>
          </Box>
          
          <Button
            leftIcon={<FiRefreshCw />}
            onClick={fetchContent}
            colorScheme="blue"
            size="sm"
          >
            Refresh
          </Button>
        </Flex>

        <Card mb={6}>
          <CardBody>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={4}
              mb={6}
            >
              <InputGroup maxW={{ base: '100%', md: '320px' }}>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search content or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>

              <Select
                placeholder="Filter by source"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                maxW={{ base: '100%', md: '200px' }}
              >
                {availableSources.map(source => (
                  <option key={source} value={source}>
                    {source === 'all' ? 'All Sources' : source.charAt(0).toUpperCase() + source.slice(1)}
                  </option>
                ))}
              </Select>

              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW={{ base: '100%', md: '200px' }}
              >
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="under_review">Under Review</option>
                <option value="active">Approved</option>
                <option value="removed">Removed</option>
              </Select>

              <Select
                placeholder="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                maxW={{ base: '100%', md: '200px' }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_reports">Most Reports</option>
              </Select>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
              <Stat bg="purple.50" p={4} borderRadius="md">
                <StatLabel>Total Reports</StatLabel>
                <StatNumber>{content.length}</StatNumber>
              </Stat>
              
              <Stat bg="yellow.50" p={4} borderRadius="md">
                <StatLabel>Pending Review</StatLabel>
                <StatNumber>
                  {content.filter(item => item.status === 'reported').length}
                </StatNumber>
              </Stat>
              
              <Stat bg="green.50" p={4} borderRadius="md">
                <StatLabel>Resolved</StatLabel>
                <StatNumber>
                  {content.filter(item => item.status === 'active' || item.status === 'removed').length}
                </StatNumber>
              </Stat>
            </SimpleGrid>

            {filteredContent.length === 0 ? (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                No reported content matches your filters
              </Alert>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Content</Th>
                      <Th>Source</Th>
                      <Th>Reported By</Th>
                      <Th>Reason</Th>
                      <Th>Date</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredContent.map((item) => (
                      <Tr key={item._id}>
                        <Td maxW="300px">
                          <Text noOfLines={2}>
                            {item.content?.text || 'No content text available'}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getSourceBadgeColor(item.source)}>
                            {item.source}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack>
                            <Avatar size="xs" name={item.reports && item.reports[0]?.userId?.username} />
                            <Text fontSize="sm">
                              {item.reports && item.reports[0]?.userId?.username || 'Anonymous'}
                              {item.reports && item.reports.length > 1 && ` +${item.reports.length - 1}`}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Tag size="sm" colorScheme="red" variant="subtle">
                            {item.reportReason || 'Not specified'}
                          </Tag>
                        </Td>
                        <Td fontSize="sm">
                          {formatDate(item.reports && item.reports[0]?.reportedAt || item.createdAt)}
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusBadgeColor(item.status)}>
                            {item.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="View Details">
                              <IconButton
                                icon={<FiEye />}
                                aria-label="View details"
                                size="sm"
                                onClick={() => handleViewDetails(item)}
                              />
                            </Tooltip>
                            <Tooltip label="Approve Content">
                              <IconButton
                                icon={<FiCheck />}
                                aria-label="Approve"
                                colorScheme="green"
                                size="sm"
                                onClick={() => handleStatusChange(item._id, 'active')}
                                isDisabled={item.status === 'active'}
                              />
                            </Tooltip>
                            <Tooltip label="Remove Content">
                              <IconButton
                                icon={<FiX />}
                                aria-label="Remove"
                                colorScheme="red"
                                size="sm"
                                onClick={() => handleStatusChange(item._id, 'removed')}
                                isDisabled={item.status === 'removed'}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Detailed view modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Flex justify="space-between" align="center">
                <Text>Content Report Details</Text>
                <Badge colorScheme={getStatusBadgeColor(selectedItem?.status)}>
                  {selectedItem?.status}
                </Badge>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedItem && (
                <VStack align="stretch" spacing={6}>
                  <Box>
                    <Text fontWeight="bold" mb={2}>Content</Text>
                    <Card variant="outline">
                      <CardBody>
                        {selectedItem.content?.image && (
                          <Image
                            src={selectedItem.content.image}
                            borderRadius="md"
                            mb={3}
                            maxH="200px"
                            objectFit="cover"
                          />
                        )}
                        <Text>{selectedItem.content?.text || 'No text content available'}</Text>
                        
                        {selectedItem.content?.url && (
                          <Link href={selectedItem.content.url} isExternal color="blue.500" mt={2} display="inline-flex" alignItems="center">
                            View original <FiExternalLink style={{ marginLeft: '4px' }} />
                          </Link>
                        )}
                      </CardBody>
                    </Card>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>Author Information</Text>
                    <HStack>
                      <Avatar 
                        name={selectedItem.author?.name || 'Unknown'} 
                        src={selectedItem.author?.avatar} 
                        size="md"
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{selectedItem.author?.name || 'Unknown'}</Text>
                        <Badge colorScheme={getSourceBadgeColor(selectedItem.source)}>
                          {selectedItem.source}
                        </Badge>
                      </VStack>
                    </HStack>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>Report Information</Text>
                    <SimpleGrid columns={2} spacing={4}>
                      <Box>
                        <Text fontWeight="semibold" fontSize="sm">Reported By</Text>
                        <VStack align="start" spacing={2} mt={1}>
                          {selectedItem.reports && selectedItem.reports.length > 0 ? (
                            selectedItem.reports.map((report, index) => (
                              <HStack key={index}>
                                <Avatar size="xs" name={report.userId?.username || 'Anonymous'} />
                                <Text fontSize="sm">{report.userId?.username || 'Anonymous'}</Text>
                              </HStack>
                            ))
                          ) : (
                            <Text fontSize="sm">No report information available</Text>
                          )}
                        </VStack>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" fontSize="sm">Reason</Text>
                        <Tag colorScheme="red" mt={1}>
                          {selectedItem.reportReason || 'Not specified'}
                        </Tag>
                        
                        <Text fontWeight="semibold" fontSize="sm" mt={3}>Date Reported</Text>
                        <Text fontSize="sm">
                          {formatDate(selectedItem.reports && selectedItem.reports[0]?.reportedAt || selectedItem.createdAt)}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                  
                  {selectedItem.status !== 'active' && selectedItem.status !== 'removed' && (
                    <>
                      <Divider />
                      
                      <Box>
                        <Text fontWeight="bold" mb={2}>Admin Response</Text>
                        <Textarea
                          placeholder="Add a note about this decision..."
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          mb={4}
                        />
                        
                        <HStack spacing={4}>
                          <Button
                            leftIcon={<FiCheck />}
                            colorScheme="green"
                            onClick={() => handleStatusChange(selectedItem._id, 'active')}
                            isDisabled={selectedItem.status === 'active'}
                          >
                            Approve Content
                          </Button>
                          
                          <Button
                            leftIcon={<FiX />}
                            colorScheme="red"
                            onClick={() => handleStatusChange(selectedItem._id, 'removed')}
                            isDisabled={selectedItem.status === 'removed'}
                          >
                            Remove Content
                          </Button>
                        </HStack>
                      </Box>
                    </>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </MotionBox>
    </Box>
  );
};

export default ContentManagement;