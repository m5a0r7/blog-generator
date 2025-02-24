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
  Divider,
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
        console.log('Fetching blogs for userId:', userId); // Debug log

        const response = await fetch(`/api/blogs/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data); // Debug log

        if (!data || !data.blogs) {
          throw new Error('Invalid response format');
        }

        setBlogs(data.blogs);
        setError(null);
      } catch (error) {
        console.error('Error details:', error); // Debug log
        setError(error instanceof Error ? error.message : 'Failed to fetch blogs');
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

                        {version.userPrompt && (
                          <Box mb={2}>
                            <Text fontSize="sm" fontWeight="bold" color="blue.500">
                              Your Request:
                            </Text>
                            <Text fontSize="sm" color="gray.700">
                              {version.userPrompt}
                            </Text>
                          </Box>
                        )}

                        <Box mb={2}>
                          <Text fontSize="sm" fontWeight="bold" color="green.500">
                            AI Response:
                          </Text>
                          <Text fontSize="sm" color="gray.700" noOfLines={3}>
                            {version.aiResponse || version.content}
                          </Text>
                          <Button 
                            size="sm" 
                            mt={1}
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

                        {version.feedback && (
                          <Box mt={2}>
                            <Text fontSize="sm" fontWeight="bold" color="orange.500">
                              Your Feedback:
                            </Text>
                            <Text fontSize="sm" color="gray.700">
                              {version.feedback}
                            </Text>
                          </Box>
                        )}

                        <Divider my={2} />
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
                      currentVersion: 0 // Latest version
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