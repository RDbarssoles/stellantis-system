import { useState, useRef, useEffect } from 'react'
import './ChatInterface.css'

export interface Message {
  id: string
  type: 'assistant' | 'user'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  onQuickReply?: (reply: string) => void
  quickReplies?: string[]
  isProcessing?: boolean
  placeholder?: string
}

function ChatInterface({
  messages,
  onSendMessage,
  onQuickReply,
  quickReplies = [],
  isProcessing = false,
  placeholder = 'Type your response...'
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleQuickReply = (reply: string) => {
    if (onQuickReply && !isProcessing) {
      onQuickReply(reply)
    }
  }

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.type === 'assistant' ? 'assistant-message' : 'user-message'}`}
          >
            <div className="message-avatar">
              {message.type === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="message assistant-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {quickReplies.length > 0 && (
        <div className="quick-replies">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              className="quick-reply-btn"
              onClick={() => handleQuickReply(reply)}
              disabled={isProcessing}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="message-input"
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!input.trim() || isProcessing}
        >
          <span className="send-icon">📤</span>
        </button>
      </form>
    </div>
  )
}

export default ChatInterface




