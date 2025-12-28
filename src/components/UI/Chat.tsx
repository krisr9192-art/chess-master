import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import type { ChatMessage } from '../../types';

interface ChatProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function Chat({ messages, onSend, disabled = false }: ChatProps) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-blue-400" />
          <span className="font-medium text-white">Chat</span>
        </div>
        <span className="text-xs text-slate-400">
          {messages.length} messages
        </span>
      </button>

      {/* Messages */}
      {isOpen && (
        <>
          <div className="h-48 overflow-y-auto p-3 border-t border-slate-700 bg-slate-900/50">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-4">
                No messages yet
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === 'me' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                        msg.sender === 'me'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-3 border-t border-slate-700"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={disabled ? 'Waiting for opponent...' : 'Type a message...'}
              disabled={disabled}
              className="input text-sm py-2"
            />
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className="btn btn-primary py-2 px-3"
            >
              <Send size={16} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
