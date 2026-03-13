'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Bot,
  User,
  Loader2,
} from 'lucide-react';
import { useMeetingStore } from '@/lib/store';
import { chatAcrossMeetings } from '@/lib/llm';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage } from '@/lib/types';

export default function ChatPage() {
  const {
    currentWorkspaceId,
    promptOptions,
    llmSettings,
  } = useMeetingStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scope, setScope] = useState<'workspace' | 'all'>('workspace');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const q = input.trim();
    if (!q || isLoading) return;

    setInput('');
    if (inputRef.current) inputRef.current.style.height = '52px';

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const filters: Record<string, string | undefined> = {};
      if (scope === 'workspace' && currentWorkspaceId) {
        filters.workspaceId = currentWorkspaceId;
      }

      const stream = await chatAcrossMeetings(messages, q, filters, promptOptions, llmSettings);
      if (!stream) throw new Error('No stream');

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      const msgId = uuidv4();

      setMessages((prev) => [...prev, { id: msgId, role: 'assistant', content: '', timestamp: Date.now() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, content: fullContent } : m)));
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : '未知错误';
      setMessages((prev) => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: `抱歉，请求出错了。\n\n${detail}`,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, scope, currentWorkspaceId, promptOptions, llmSettings]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#E3D9CE]/50 px-6 py-4 sm:px-8">
        <h1 className="font-song text-lg font-semibold text-[#3A2E25] pl-10 md:pl-0">AI 对话</h1>
        <div className="flex items-center rounded-lg border border-[#D8CEC4] bg-white p-0.5 text-[11px]">
          <button
            onClick={() => setScope('workspace')}
            className={`rounded-md px-2.5 py-1 transition-all ${
              scope === 'workspace' ? 'bg-[#4A3C31] text-white' : 'text-[#8C7A6B] hover:text-[#5C4D42]'
            }`}
          >
            当前工作区
          </button>
          <button
            onClick={() => setScope('all')}
            className={`rounded-md px-2.5 py-1 transition-all ${
              scope === 'all' ? 'bg-[#4A3C31] text-white' : 'text-[#8C7A6B] hover:text-[#5C4D42]'
            }`}
          >
            全部
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className={`flex-1 px-6 py-6 sm:px-8 ${
          messages.length === 0 ? 'overflow-hidden' : 'space-y-5 overflow-y-auto pb-36'
        }`}
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-[#A69B8F]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] border border-amber-100/50 bg-amber-50">
              <Bot size={24} className="text-amber-500" />
            </div>
            <p className="font-song mb-1 text-[17px] font-semibold text-[#3A2E25]">知识库问答</p>
            <p className="max-w-[280px] text-center text-[13px] leading-6 text-[#A69B8F]">
              跨会议提问，快速召回历史结论与线索。
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 border border-amber-100/50">
                <Bot size={16} className="text-amber-500" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#4A3C31] text-white rounded-tr-sm'
                  : 'bg-white text-[#3A2E25] border border-[#E3D9CE]/50 rounded-tl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.role === 'assistant' && !msg.content && isLoading && (
                <div className="flex items-center gap-2 text-amber-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">思考中...</span>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F3EE] border border-[#E3D9CE]/50">
                <User size={16} className="text-[#8C7A6B]" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-[#E3D9CE]/50 bg-[#F9F9F8] px-6 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <div className="flex flex-1 items-end rounded-2xl border border-[#D8CEC4] bg-white p-2 shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入跨会议问题..."
              disabled={isLoading}
              rows={1}
              style={{ minHeight: '52px', maxHeight: '140px' }}
              className="flex-1 resize-none bg-transparent px-3 py-3 text-[15px] text-[#3A2E25] placeholder:text-[#A69B8F] focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                input.trim() && !isLoading
                  ? 'bg-[#4A3C31] text-white hover:bg-[#3A2E25] shadow-sm'
                  : 'bg-[#F7F3EE] text-[#A69B8F]'
              }`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
