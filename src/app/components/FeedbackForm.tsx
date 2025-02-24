import React, { useState } from 'react';

interface FeedbackFormProps {
  content: string;
  topic: string;
  blogId: string;
  onImprovedContent: (content: string) => void;
}

export default function FeedbackForm({ content, topic, blogId, onImprovedContent }: FeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [improvedContent, setImprovedContent] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);

  const handleFeedbackSubmit = async () => {
    console.log('handleFeedbackSubmit called');
    
    try {
      if (!feedbackType) {
        console.log('No feedback type selected');
        return;
      }

      console.log('FeedbackType:', feedbackType);
      console.log('BlogId:', blogId);
      console.log('Content:', content);
      
      setIsSubmitting(true);

      if (feedbackType === 'negative') {
        console.log('Attempting negative feedback submission');
        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              topic,
              content,
              feedbackType,
              feedback: improvementSuggestion,
              blogId
            }),
          });

          if (!response.ok) {
            throw new Error(`Generate API failed with status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Generate API response:', data);
          
          if (data.content) {
            setImprovedContent(data.content);
            setShowSaveButton(true);
          }

          // Save the feedback
          console.log('Saving feedback...');
          const responseSave = await fetch('/api/feedback/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              blogId,
              content: improvementSuggestion,
              type: feedbackType,
            }),
          });

          const feedbackData = await responseSave.json();
          console.log('Feedback save response:', feedbackData);

        } catch (generateError) {
          console.error('Error in generate API:', generateError);
          throw generateError;
        }
      } else if (feedbackType === 'positive') {
        console.log('Attempting positive feedback submission');
        try {
          const responseSave = await fetch('/api/feedback/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              blogId,
              content: 'User liked this version',
              type: feedbackType,
            }),
          });

          if (!responseSave.ok) {
            throw new Error(`Feedback save failed with status: ${responseSave.status}`);
          }

          const feedbackData = await responseSave.json();
          console.log('Positive feedback save response:', feedbackData);

          console.log('Attempting to save version');
          await handleSaveVersion(content);
        } catch (saveError) {
          console.error('Error in feedback save:', saveError);
          throw saveError;
        }
      }
    } catch (error) {
      console.error('Top level error in handleFeedbackSubmit:', error);
    } finally {
      console.log('Feedback submission completed');
      setIsSubmitting(false);
    }
  };

  const handleSaveVersion = async (contentToSave = improvedContent) => {
    console.log('handleSaveVersion called with content length:', contentToSave?.length);
    
    try {
      if (!blogId) {
        console.error('No blogId provided');
        return;
      }

      const requestData = {
        blogId,
        content: contentToSave,
        feedback: feedbackType === 'positive' ? 'User liked this version' : improvementSuggestion,
        improvementPrompt: feedbackType === 'positive' 
          ? 'User approved this version' 
          : `Improvement based on feedback: ${improvementSuggestion}`,
        aiResponse: contentToSave,
      };

      console.log('Attempting to save version with data:', requestData);

      const response = await fetch('/api/versions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save version: ${errorData.error || response.status}`);
      }

      const data = await response.json();
      console.log('Version save response:', data);

      onImprovedContent(contentToSave);
      setShowSaveButton(false);
      setImprovedContent('');
      setFeedbackType(null);
      setImprovementSuggestion('');
    } catch (error) {
      console.error('Error in handleSaveVersion:', error);
      throw error; // Re-throw to be caught by the calling function
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={() => setFeedbackType('positive')}
          className={`px-4 py-2 rounded ${
            feedbackType === 'positive' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}
        >
          👍 Good
        </button>
        <button
          onClick={() => setFeedbackType('negative')}
          className={`px-4 py-2 rounded ${
            feedbackType === 'negative' ? 'bg-red-500 text-white' : 'bg-gray-200'
          }`}
        >
          👎 Needs Improvement
        </button>
      </div>

      {feedbackType === 'negative' && (
        <div className="space-y-2">
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Please describe how the blog post can be improved..."
            value={improvementSuggestion}
            onChange={(e) => setImprovementSuggestion(e.target.value)}
          />
          <button
            onClick={handleFeedbackSubmit}
            disabled={isSubmitting || !improvementSuggestion}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      )}

      {feedbackType === 'positive' && (
        <div className="space-y-2">
          <button
            onClick={() => {
              console.log('Positive feedback button clicked');
              handleFeedbackSubmit();
            }}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {isSubmitting ? 'Saving...' : 'Save This Version'}
          </button>
        </div>
      )}

      {showSaveButton && improvedContent && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-bold mb-2">Improved Version:</h3>
            <p className="whitespace-pre-wrap">{improvedContent}</p>
          </div>
          <button
            onClick={() => handleSaveVersion()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save New Version
          </button>
        </div>
      )}
    </div>
  );
} 