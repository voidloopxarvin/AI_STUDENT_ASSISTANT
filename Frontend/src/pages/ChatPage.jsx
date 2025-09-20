import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Download, 
  Trash2,
  Bot,
  User,
  Sparkles,
  Clock
} from 'lucide-react';
import { apiService } from '../services/api';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI Study Assistant. How can I help you today? I can assist with explanations, answer questions, help with homework, or discuss any topic you\'re studying.',
      timestamp: new Date(),
      likes: 0,
      dislikes: 0
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const speechSynthesis = window.speechSynthesis;

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Text-to-speech function
  const speakResponse = (text) => {
    if (speechSynthesis && speechEnabled) {
      speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Voice input toggle
  const toggleVoiceInput = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

const simulateAIResponse = async (userInput) => {
  try {
    const sessionId = 'user-session-' + Date.now();
    
    const response = await apiService.sendChatMessage(
      userInput, 
      sessionId, 
      conversationHistory
    );

    const aiMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: response.response,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0
    };

    setMessages(prev => [...prev, aiMessage]);
    
    setConversationHistory(prev => [
      ...prev,
      { user: userInput, bot: response.response, timestamp: new Date() }
    ]);

    if (speechEnabled) {
      speakResponse(response.response);
    }

  } catch (error) {
    console.error('Error getting AI response:', error);
    const errorMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: 'Sorry, I encountered an error while processing your request. Please try again.',
      timestamp: new Date(),
      isError: true,
      likes: 0,
      dislikes: 0
    };
    setMessages(prev => [...prev, errorMessage]);
  }
};

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = inputText.trim();
    setInputText('');

    // Simulate AI response
    await simulateAIResponse(currentInput);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = (messageId, reactionType) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          [reactionType]: msg[reactionType] + 1
        };
      }
      return msg;
    }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: 'Hello! I\'m your AI Study Assistant. How can I help you today?',
        timestamp: new Date(),
        likes: 0,
        dislikes: 0
      }
    ]);
    setConversationHistory([]);
  };

  const exportChat = () => {
    const chatData = messages.map(msg => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp.toLocaleString()
    }));
    
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Study Assistant</h1>
              <p className="text-sm text-gray-400">
                {isLoading ? 'Thinking...' : 'Ready to help with your studies'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                speechEnabled ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
              title="Toggle text-to-speech"
            >
              {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={exportChat}
              className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition-colors"
              title="Export chat"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={clearChat}
              className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : message.isError
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}
              >
                {message.type === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`max-w-3xl ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`rounded-xl p-4 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : message.isError
                      ? 'bg-red-900/50 border border-red-500/50 text-red-300'
                      : 'bg-gray-800 border border-gray-700 text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>

                {/* Message Footer */}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                  </div>

                  {message.type === 'bot' && !message.isError && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Copy message"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleReaction(message.id, 'likes')}
                          className="p-1 hover:bg-gray-700 rounded transition-colors flex items-center space-x-1"
                          title="Like"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          {message.likes > 0 && <span>{message.likes}</span>}
                        </button>
                        <button
                          onClick={() => handleReaction(message.id, 'dislikes')}
                          className="p-1 hover:bg-gray-700 rounded transition-colors flex items-center space-x-1"
                          title="Dislike"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          {message.dislikes > 0 && <span>{message.dislikes}</span>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                  <span className="text-gray-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                rows="1"
                disabled={isLoading}
              />
              
              {/* Voice Input Button */}
              <button
                onClick={toggleVoiceInput}
                className={`absolute right-3 top-3 p-1 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
                disabled={isLoading}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;