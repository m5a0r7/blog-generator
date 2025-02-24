import React, { useState } from 'react';

interface FeedbackFormProps {
  content: string;
  topic: string;
  onImprovedContent: (content: string) => void;
}

export default function FeedbackForm({ content, topic, onImprovedContent }: FeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          content,
          feedbackType,
          improvementSuggestion
        }),
      });

      const data = await response.json();
      
      if (data.improvedContent) {
        onImprovedContent(data.improvedContent);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
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
        <button
          onClick={handleFeedbackSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      )}
    </div>
  );
} 