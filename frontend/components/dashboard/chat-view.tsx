'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import RiskScoreDisplay from './risk-score-display' // Import the component

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}
// Add RiskData interface
interface RiskData {
  cardiovascular: { score: number; justification: string };
  diabetes: { score: number; justification: string };
  liver: { score: number; justification: string };
}

interface ChatViewProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading: boolean
  riskData: RiskData | null; // Add riskData prop
}

export default function ChatView({ messages, onSendMessage, isLoading, riskData }: ChatViewProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, riskData]); // Add riskData to dependency array

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const formatContent = (content: string) => {
    return content
      .replace(/# (.*?)$/gm, '<h1 class="text-3xl font-black uppercase tracking-wide mb-4 border-b-4 border-black pb-2">$1</h1>')
      .replace(/## (.*?)$/gm, '<h2 class="text-2xl font-black uppercase tracking-wide mb-3 mt-6">$1</h2>')
      .replace(/### (.*?)$/gm, '<h3 class="text-xl font-black uppercase tracking-wide mb-2 mt-4">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black bg-black text-white px-1">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="font-bold underline">$1</em>')
      .replace(/- (.*?)$/gm, '<li class="font-bold mb-1">• $1</li>')
      .replace(/\n/g, '<br />')
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {riskData && <RiskScoreDisplay riskData={riskData} />}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-4xl transition-all duration-200 ${
                message.role === 'user'
                  ? 'neo-chat-user'
                  : 'neo-chat-assistant'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: formatContent(message.content)
                }}
                className="prose prose-lg max-w-none"
              />
              <div className="text-xs font-bold mt-4 pt-2 border-t-2 border-gray-300 uppercase tracking-wide">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="neo-chat-assistant flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="uppercase tracking-wide">AI IS THINKING...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t-4 border-black p-8 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ASK A FOLLOW-UP QUESTION ABOUT YOUR REPORT..."
            className="flex-1 neo-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="neo-button px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  )
}