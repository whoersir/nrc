'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user_session');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const messageContent = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/knot/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          sessionId: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || data.content || '抱歉，我无法理解您的问题。'
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // 保存返回的 conversationId 用于后续对话
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后重试。'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background to-muted/30 overflow-hidden">
      <div className="w-full max-w-[900px] h-[90vh] glass-card rounded-2xl overflow-hidden flex flex-col">
        {/* 头部区域 */}
        <div className="bg-background/80 backdrop-blur-sm border-b p-4 flex-shrink-0">
          <h1 className="text-2xl font-bold mb-1">AI 对话</h1>
          <p className="text-muted-foreground">
            {user ? `欢迎，${user.nickname || user.username}！` : '智能助手随时待命'}
          </p>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-hidden p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>开始与 AI 助手对话吧...</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 text-base ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的问题..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-base rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span>发送</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
