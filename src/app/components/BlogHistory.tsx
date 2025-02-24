'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  Badge
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

interface BlogVersion {
  content: string;
  timestamp: string;
  feedback?: string;
  improvementPrompt?: string;
  aiResponse?: string;
  userPrompt?: string;
}

interface Blog {
  id: string;
  topic: string;
  versions: BlogVersion[];
  currentVersion: number;
  feedback: {
    id: string;
    content: string;
    type: string;
    timestamp: Date;
  }[];
}

interface BlogHistoryProps {
  userId: string;
  onSelectBlog?: (blog: Blog) => void;
  onNewBlog: () => void;
}

export default function BlogHistory({ userId, onSelectBlog, onNewBlog }: BlogHistoryProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!userId) {
        setError('User ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching blogs for userId:', userId);

        const response = await fetch(`/api/blogs/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          let errorMessage = `Failed to fetch blogs (Status: ${response.status})`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `${errorMessage} - ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (!data) {
          throw new Error('No data received from server');
        }
        if (!Array.isArray(data.blogs)) {
          throw new Error('Invalid response format: blogs array not found');
        }

        setBlogs(data.blogs);
        setError(null);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred while fetching blogs');
        setBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [userId]);

  if (isLoading) {
    return <Text>Loading blogs...</Text>;
  }

  if (error) {
    return <Text color="red.500">Error: {error}</Text>;
  }

  if (!blogs?.length) {
    return <Text>No blogs found.</Text>;
  }

  return (
    <Box w="100%">
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Your Blog History</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="green"
          onClick={onNewBlog}
        >
          Create New Blog
        </Button>
      </HStack>

      {blogs.length === 0 ? (
        <VStack spacing={4} align="center" py={8}>
          <Text>No blogs generated yet.</Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onNewBlog}
          >
            Generate Your First Blog
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4} align="stretch" w="100%">
          {blogs.map((blog) => (
            <Box 
              key={blog.id} 
              p={4} 
              border="1px" 
              borderColor="gray.200" 
              borderRadius="md"
              shadow="sm"
            >
              <Heading size="md" mb={2}>{blog.topic}</Heading>
              
              <Accordion allowToggle>
                <AccordionItem>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Conversation History ({blog.versions?.length || 0} versions)
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    {blog.versions?.map((version, index) => (
                      <Box 
                        key={index} 
                        p={3}
                        mb={3}
                        bg="gray.50"
                        borderRadius="md"
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Badge colorScheme={index === 0 ? "green" : "blue"}>
                            Version {blog.versions.length - index}
                          </Badge>
                          <Text fontSize="sm" color="gray.600">
                            {new Date(version.timestamp).toLocaleString()}
                          </Text>
                        </Box>

                        {/* Initial content */}
                        <Box mb={2} p={2} bg="green.50" borderRadius="md">
                          <Text fontSize="sm" fontWeight="bold" color="green.500">
                            Generated Content:
                          </Text>
                          <Text fontSize="sm" color="gray.700">
                            {version.content}
                          </Text>
                        </Box>

                        {/* Show feedback and AI responses */}
                        {blog.feedback?.map((feedback, fIndex) => {
                          const feedbackDate = new Date(feedback.timestamp);
                          const nextVersionDate = blog.versions[index - 1]?.timestamp 
                            ? new Date(blog.versions[index - 1].timestamp) 
                            : new Date();
                          const currentVersionDate = new Date(version.timestamp);

                          // Only show feedback that occurred after this version but before the next version
                          if (feedbackDate > currentVersionDate && feedbackDate < nextVersionDate) {
                            return (
                              <Box key={fIndex}>
                                <Box mb={2} p={2} bg="orange.50" borderRadius="md">
                                  <Text fontSize="sm" fontWeight="bold" color="orange.500">
                                    Feedback ({new Date(feedback.timestamp).toLocaleString()}):
                                  </Text>
                                  <Text fontSize="sm" color="gray.700">
                                    {feedback.content}
                                  </Text>
                                  {feedback.type && (
                                    <Badge mt={1} colorScheme={feedback.type === 'positive' ? 'green' : 'red'}>
                                      {feedback.type}
                                    </Badge>
                                  )}
                                </Box>

                                {/* Show AI response if it exists */}
                                {version.aiResponse && (
                                  <Box mb={2} p={2} bg="blue.50" borderRadius="md">
                                    <Text fontSize="sm" fontWeight="bold" color="blue.500">
                                      AI Response:
                                    </Text>
                                    <Text fontSize="sm" color="gray.700">
                                      {version.aiResponse}
                                    </Text>
                                  </Box>
                                )}
                              </Box>
                            );
                          }
                          return null;
                        })}

                        <Button 
                          size="sm" 
                          mt={3}
                          onClick={() => {
                            if (onSelectBlog) {
                              onSelectBlog({
                                ...blog,
                                currentVersion: index
                              });
                            }
                          }}
                        >
                          View Full Content
                        </Button>
                      </Box>
                    ))}
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
              
              <Button 
                mt={2} 
                size="sm"
                colorScheme="blue"
                onClick={() => {
                  if (onSelectBlog) {
                    onSelectBlog({
                      ...blog,
                      currentVersion: 0
                    });
                  }
                }}
              >
                View Latest Version
              </Button>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
} 