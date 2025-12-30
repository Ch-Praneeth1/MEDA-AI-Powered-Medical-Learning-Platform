'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Stethoscope, GraduationCap, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

interface DebateMessage {
  role: 'doctor' | 'resident' | 'patient';
  content: string;
  name: string;
}

export default function MedicalArena() {
  const [symptoms, setSymptoms] = useState('');
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [isDebating, setIsDebating] = useState(false);
  const selectedModel = 'llama-3.3-70b-versatile'; // Fixed model for now - TODO: Make use of multiple models based on keys avalibility
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startDebate = async () => {
    if (!symptoms.trim() || isDebating) return;

    setIsDebating(true);
    setMessages([]);

    try {
      const response = await fetch('http://localhost:8000/arena/debate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms,
          model: selectedModel,
          max_rounds: 25
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start debate');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }

              try {
                const message = JSON.parse(data);
                if (message.error) {
                  console.error('Debate error:', message.error);
                } else if (message.role && message.content) {
                  setMessages(prev => [...prev, {
                    role: message.role,
                    content: message.content,
                    name: message.name
                  }]);
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during debate:', error);
      alert('Failed to start debate. Please ensure the backend is running.');
    } finally {
      setIsDebating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startDebate();
    }
  };

  // Separating messages by role for three-column display
  const doctorMessages = messages.filter(m => m.role === 'doctor');
  const residentMessages = messages.filter(m => m.role === 'resident');
  const patientMessages = messages.filter(m => m.role === 'patient');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-blue-800/10 animate-pulse" style={{animationDuration: '8s'}}></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">

        <div className="bg-gradient-to-r from-slate-900/80 to-blue-950/80 backdrop-blur-md border-b border-blue-500/20 py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Arena</span>
                </h1>
                <p className="text-sm text-gray-400">Doctor-Resident Diagnostic Debate System</p>
              </div>
            </div>
          </div>
        </div>


        <div className="flex-1 flex flex-col p-6">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-3xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 rounded-full">
                      <Stethoscope className="w-12 h-12 text-blue-400" />
                    </div>
                    <div className="text-4xl font-bold text-gray-400">VS</div>
                    <div className="p-4 bg-gradient-to-br from-cyan-600/20 to-blue-500/20 rounded-full">
                      <GraduationCap className="w-12 h-12 text-cyan-400" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Multi-Agent Medical Analysis
                  </h2>
                  <p className="text-gray-300 mb-2">
                    Watch as a Senior Surgeon and Junior Resident debate your case
                  </p>
                  <p className="text-sm text-gray-400">
                    Enter patient symptoms below to start the diagnostic discussion
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-900/40 via-blue-950/30 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-blue-500/20 shadow-2xl p-6">
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe patient symptoms, medical history, and concerns...&#10;&#10;Example: 45-year-old male presenting with severe chest pain radiating to left arm, shortness of breath, and sweating for the past 30 minutes. History of hypertension and smoking."
                    className="w-full bg-slate-900/60 border border-blue-500/40 text-white rounded-xl p-4 resize-none h-48 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-blue-400/50 shadow-lg"
                    disabled={isDebating}
                  />
                  
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      Press Enter or click Start to begin the debate
                    </p>
                    <button
                      onClick={startDebate}
                      disabled={isDebating || !symptoms.trim()}
                      className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                        isDebating || !symptoms.trim()
                          ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                          : 'bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-cyan-500/50'
                      }`}
                    >
                      {isDebating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Debating...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Start Debate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4">
            
              <div className="bg-gradient-to-br from-slate-900/60 to-blue-950/40 backdrop-blur-sm rounded-xl border border-blue-500/20 p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Patient Case:</h3>
                <p className="text-white text-sm leading-relaxed">{symptoms}</p>
              </div>


              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">

                <div className="flex flex-col bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-xl border border-purple-500/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600/30 to-pink-500/20 border-b border-purple-500/30 p-4 flex items-center gap-3">
                    <User className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="font-bold text-white">Patient</h3>
                      <p className="text-xs text-gray-300">Case Updates</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {patientMessages.map((msg, idx) => (
                      <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/10 border border-purple-500/30 rounded-lg p-3 shadow-lg max-w-[90%]">
                          <p className="text-sm text-gray-100 leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>


                <div className="flex flex-col bg-gradient-to-br from-blue-900/20 to-slate-900/40 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border-b border-blue-500/30 p-4 flex items-center gap-3">
                    <Stethoscope className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="font-bold text-white">Dr. Bhavana</h3>
                      <p className="text-xs text-gray-300">Senior Surgeon</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {doctorMessages.map((msg, idx) => (
                      <div key={idx} className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-500/30 rounded-lg p-3 shadow-lg max-w-[90%]">
                          <p className="text-sm text-gray-100 leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isDebating && doctorMessages.length < messages.length && (
                      <div className="flex items-center gap-2 text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Analyzing...</span>
                      </div>
                    )}
                  </div>
                </div>


                <div className="flex flex-col bg-gradient-to-br from-cyan-900/20 to-slate-900/40 backdrop-blur-sm rounded-xl border border-cyan-500/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-600/30 to-blue-500/20 border-b border-cyan-500/30 p-4 flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-cyan-400" />
                    <div>
                      <h3 className="font-bold text-white">Dr. Anuradha</h3>
                      <p className="text-xs text-gray-300">Junior Resident</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {residentMessages.map((msg, idx) => (
                      <div key={idx} className="animate-in fade-in slide-in-from-right-2 duration-300">
                        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-500/10 border border-cyan-500/30 rounded-lg p-3 shadow-lg max-w-[90%]">
                          <p className="text-sm text-gray-100 leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isDebating && residentMessages.length < messages.length && (
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              
              <div className="flex justify-center gap-4 pb-4">
                <button
                  onClick={() => {
                    setMessages([]);
                    setSymptoms('');
                  }}
                  disabled={isDebating}
                  className="px-6 py-2 bg-slate-800/60 border border-blue-500/40 text-gray-300 rounded-lg hover:bg-blue-900/40 hover:border-blue-400/50 transition-all disabled:opacity-50"
                >
                  New Case
                </button>
              </div>

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

       
        <div className="bg-gradient-to-r from-slate-900/80 to-blue-950/80 backdrop-blur-md border-t border-blue-500/20 py-3 px-6">
          <p className="text-center text-xs text-gray-400">
            ⚠️ This is a simulated medical discussion using AI agents. Always consult a real doctor for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
