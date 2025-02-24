'use client'
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Input,
  Button,
  Text,
  Textarea,
  VStack,
  Heading,
  Alert,
  useToast,
} from '@chakra-ui/react';
import Login from './components/Login';
import Register from './components/Register';
import BlogHistory from './components/BlogHistory';

interface BlogVersion {
  content: string;
  timestamp: string;
  feedback?: string;
  improvementPrompt?: string;
}

interface Blog {
  id: string;
  topic: string;
  versions: BlogVersion[];
  currentVersion: number;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{show: boolean; message: string; status: 'error' | 'success'}>({ 
    show: false, 
    message: '', 
    status: 'error' 
  });
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const toast = useToast();
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (storedUserId && token) {
      setIsLoggedIn(true);
      setUserId(storedUserId);
    }
  }, []);

  const handleLogin = (newUserId: string) => {
    setIsLoggedIn(true);
    setUserId(newUserId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUserId(null);
  };

  const showAlert = (message: string, status: 'error' | 'success' = 'error') => {
    setAlert({ show: true, message, status });
    setTimeout(() => setAlert({ show: false, message: '', status: 'error' }), 3000);
  };

  const generateBlogPost = async () => {
    if (!topic.trim()) {
      showAlert('Please enter a topic or title');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, userId }),
      });

      const data = await response.json();
      setGeneratedContent(data.content);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to generate blog post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleFeedback = async (feedback: 'positive' | 'negative') => {
    if (feedback === 'positive') {
      toast({
        title: 'Thank you!',
        description: 'Glad you liked the content!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // For negative feedback, enter feedback mode
    setIsFeedbackMode(true);
  };

  const submitFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          topic,
          content: generatedContent,
          feedbackType: 'negative',
          improvementSuggestion: feedbackMessage,
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();
      if (data.improvedContent) {
        setGeneratedContent(data.improvedContent);
        setIsFeedbackMode(false);
        setFeedbackMessage('');
        
        toast({
          title: 'Content Updated',
          description: 'The blog post has been improved based on your feedback',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to process feedback',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleSelectBlog = (blog: Blog) => {
    if (blog && blog.versions && blog.versions.length > 0) {
      setTopic(blog.topic);
      // Get the content from the current version or default to the first version
      const selectedVersion = blog.versions[blog.currentVersion || 0];
      setGeneratedContent(selectedVersion?.content || '');
      setShowHistory(false);
    } else {
      console.error('Invalid blog data:', blog);
      // Optionally show an error message to the user
      toast({
        title: 'Error',
        description: 'Could not load the selected blog',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetState = () => {
    setTopic('');
    setGeneratedContent('');
    setIsFeedbackMode(false);
    setFeedbackMessage('');
  };

  if (!isLoggedIn) {
    return (
      <Container maxW="container.lg" py={10}>
        <Heading textAlign="center" mb={8}>AI Blog Generator</Heading>
        {isLoginMode ? (
          <Login onLogin={handleLogin} onToggleMode={() => setIsLoginMode(false)} />
        ) : (
          <Register onToggleMode={() => setIsLoginMode(true)} />
        )}
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack gap={8}>
        <Box w="100%" display="flex" justifyContent="space-between" alignItems="center">
          <Heading>AI Blog Generator</Heading>
          <Box>
            <Button
              onClick={() => {
                setShowHistory(!showHistory);
                if (showHistory) {
                  resetState();
                }
              }}
              colorScheme="blue"
              size="sm"
              mr={2}
            >
              {showHistory ? 'New Blog' : 'History'}
            </Button>
            <Button onClick={handleLogout} colorScheme="red" size="sm">
              Logout
            </Button>
          </Box>
        </Box>
        
        {showHistory ? (
          <BlogHistory 
            userId={userId!} 
            onSelectBlog={handleSelectBlog}
            onNewBlog={() => setShowHistory(false)}
          />
        ) : (
          <>
            <Box w="100%">
              <Input
                placeholder="Enter your blog topic or title"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                size="lg"
              />
            </Box>

            <Button
              colorScheme="blue"
              onClick={generateBlogPost}
              disabled={isLoading}
              loadingText="Generating..."
              width="full"
            >
              Generate Blog Post
            </Button>

            {generatedContent && !isFeedbackMode && (
              <Box w="100%">
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  height="400px"
                  mb={4}
                />
                
                <Text mb={2}>Was this content helpful?</Text>
                <Button
                  colorScheme="green"
                  mr={2}
                  onClick={() => handleFeedback('positive')}
                >
                  👍 Yes
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => handleFeedback('negative')}
                >
                  👎 No
                </Button>
              </Box>
            )}

            {isFeedbackMode && (
              <Box w="100%">
                <Text mb={2}>How can we improve this content?</Text>
                <Textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Please provide specific feedback about what you'd like to improve..."
                  mb={4}
                />
                <Button
                  colorScheme="blue"
                  onClick={submitFeedback}
                  isLoading={isLoading}
                >
                  Submit Feedback
                </Button>
              </Box>
            )}
          </>
        )}

        {alert.show && (
          <Alert status={alert.status}>
            {alert.message}
          </Alert>
        )}
      </VStack>
    </Container>
  );
} 