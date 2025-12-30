'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, ChevronDown, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Dashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchModels = async () => {
    try {
      setIsLoadingModels(true);
      const response = await fetch('http://localhost:8000/models');
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models);
        setSelectedModel(data.default);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setAvailableModels([
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'meta-llama/llama-guard-4-12b',
        'openai/gpt-oss-20b',
        'openai/gpt-oss-120b'
      ]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again after sometime.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-blue-800/10 animate-pulse" style={{animationDuration: '8s'}}></div>
      <div className="flex-1 flex flex-col pt-4 px-4 relative z-10">
        <div className="flex-shrink-0 mb-4">
          <div className="flex items-center justify-center max-w-5xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">M</span>edical{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">E</span>nlightened{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">D</span>igital{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">A</span>ssistant
            </h1>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center pb-4">
          <div className="w-full max-w-5xl h-[calc(100vh-180px)] flex flex-col bg-gradient-to-br from-slate-900/40 via-blue-950/30 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-blue-500/20 shadow-2xl shadow-blue-500/10">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="text-center mb-8">
                  <div className="inline-block p-4 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 rounded-full mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-3xl">💬</span>
                    </div>
                  </div>
                  <p className="text-xl text-gray-200 font-medium mb-2">
                    Your AI Medical Research Assistant
                  </p>
                  <p className="text-sm text-gray-400">
                    Ask me anything about medical research, treatments, or healthcare
                  </p>
                </div>

                <div className="w-full max-w-3xl px-6">
                  <div className="flex gap-3">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about medical research..."
                      className="flex-1 bg-slate-900/60 border border-blue-500/40 text-white rounded-xl p-4 resize-none min-h-[56px] max-h-[120px] text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-blue-400/50 shadow-lg"
                      disabled={isSending}
                      rows={1}
                    />
                    
                  
                    <div className="relative z-[200]">
                      <button
                        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        disabled={isLoadingModels}
                        className="flex items-center gap-1 px-3 h-[56px] bg-slate-800/60 border border-blue-500/40 text-gray-300 rounded-lg hover:bg-blue-900/40 hover:border-blue-400/50 transition-all disabled:opacity-50 text-xs whitespace-nowrap shadow-lg"
                        title={selectedModel}
                      >
                        {isLoadingModels ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <span className="hidden sm:inline">Model</span>
                            <ChevronDown className="h-3 w-3" />
                          </>
                        )}
                      </button>
                    </div>
                    
                    {isModelDropdownOpen && !isLoadingModels && (
                      <div className="fixed inset-0 z-[150]" onClick={() => setIsModelDropdownOpen(false)}>
                        <div 
                          className="absolute bottom-32 right-8 w-64 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 rounded-lg shadow-2xl max-h-64 overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {availableModels.map((model) => (
                            <button
                              key={model}
                              onClick={() => {
                                setSelectedModel(model);
                                setIsModelDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                                selectedModel === model
                                  ? 'bg-blue-900/40 text-cyan-400'
                                  : 'text-gray-300 hover:bg-blue-900/20 hover:text-white'
                              }`}
                            >
                              {model}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || !inputMessage.trim()}
                      className={`rounded-xl w-[56px] h-[56px] flex items-center justify-center transition-all ${
                        isSending || !inputMessage.trim()
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-cyan-500/50'
                      }`}
                    >
                      {isSending ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Send className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                              message.role === 'user'
                                ? 'bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-gradient-to-br from-slate-800/80 via-blue-950/60 to-slate-800/80 text-gray-100 border border-blue-500/30 shadow-lg'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>
                  
                <div className="border-t border-blue-500/30 bg-gradient-to-br from-slate-900/60 to-blue-950/40 backdrop-blur-md p-4">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex gap-3">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about medical research..."
                        className="flex-1 bg-slate-900/60 border border-blue-500/40 text-white rounded-xl p-4 resize-none min-h-[56px] max-h-[120px] text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-blue-400/50 shadow-lg"
                        disabled={isSending}
                        rows={1}
                      />
                      
                      <div className="relative z-[200]">
                        <button
                          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                          disabled={isLoadingModels}
                          className="flex items-center gap-1 px-3 h-[56px] bg-slate-800/60 border border-blue-500/40 text-gray-300 rounded-lg hover:bg-blue-900/40 hover:border-blue-400/50 transition-all disabled:opacity-50 text-xs whitespace-nowrap shadow-lg"
                          title={selectedModel}
                        >
                          {isLoadingModels ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <span className="hidden sm:inline">Model</span>
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      </div>
                      
                      {isModelDropdownOpen && !isLoadingModels && (
                        <div className="fixed inset-0 z-[150]" onClick={() => setIsModelDropdownOpen(false)}>
                          <div 
                            className="absolute bottom-32 right-8 w-64 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 rounded-lg shadow-2xl max-h-64 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {availableModels.map((model) => (
                              <button
                                key={model}
                                onClick={() => {
                                  setSelectedModel(model);
                                  setIsModelDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                                  selectedModel === model
                                    ? 'bg-blue-900/40 text-cyan-400'
                                    : 'text-gray-300 hover:bg-blue-900/20 hover:text-white'
                                }`}
                              >
                                {model}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleSendMessage}
                        disabled={isSending || !inputMessage.trim()}
                        className={`rounded-xl w-[56px] h-[56px] flex items-center justify-center transition-all shadow-lg ${
                          isSending || !inputMessage.trim()
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 shadow-blue-500/50 hover:shadow-xl hover:shadow-cyan-500/50'
                        }`}
                      >
                        {isSending ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Send className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


