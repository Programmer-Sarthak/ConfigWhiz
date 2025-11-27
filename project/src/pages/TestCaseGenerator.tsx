import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AI_API_URL = "http://127.0.0.1:8000/chat";

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function TestCaseGenerator() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hello! I'm your AI Test Assistant. Paste your code below, and I will generate professional test cases for it.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('python');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(AI_API_URL, {
        text: userMsg.content,
        language: language
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "Error: Could not connect to the AI server. Make sure it is running on port 8000.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-4 h-100 d-flex flex-column" style={{ height: 'calc(100vh - 76px)' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
           <h1 className="h3 mb-0 d-flex align-items-center gap-2">
             <Sparkles className="text-primary" />
             AI Test Chat
           </h1>
           <p className="text-muted small mb-0">Chat with Gemini to generate test suites</p>
        </div>
        
        <select 
          className="form-select bg-dark text-light border-secondary" 
          style={{ width: 'auto' }}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="python">Python Mode</option>
          <option value="javascript">JavaScript Mode</option>
          <option value="java">Java Mode</option>
        </select>
      </div>

      <div className="card bg-dark border-secondary flex-grow-1 overflow-hidden shadow-lg">
        <div className="card-body p-0 d-flex flex-column h-100">
          <div className="flex-grow-1 overflow-auto p-4">
            <div className="d-flex flex-column gap-4">
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`d-flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 rounded-circle p-2 d-flex align-items-center justify-content-center ${msg.role === 'user' ? 'bg-primary' : 'bg-secondary'}`} style={{ width: 40, height: 40 }}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  
                  <div 
                    className={`rounded-4 p-3 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-black border border-secondary text-light'}`}
                    style={{ maxWidth: '80%' }}
                  >
                    <div style={{ whiteSpace: 'pre-wrap', fontFamily: msg.role === 'bot' ? 'monospace' : 'inherit' }}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                 <div className="d-flex gap-3">
                    <div className="flex-shrink-0 rounded-circle bg-secondary p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                        <Bot size={20} />
                    </div>
                    <div className="bg-black border border-secondary rounded-4 p-3 d-flex align-items-center gap-2">
                        <Loader className="spinner-border spinner-border-sm text-primary" />
                        <span className="text-muted">Thinking...</span>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-3 border-top border-secondary bg-black bg-opacity-25">
            <div className="input-group">
              <textarea
                className="form-control bg-dark text-light border-secondary"
                placeholder={`Paste your ${language} code here...`}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ resize: 'none', minHeight: '50px' }}
              />
              <button 
                className="btn btn-primary d-flex align-items-center px-4"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}