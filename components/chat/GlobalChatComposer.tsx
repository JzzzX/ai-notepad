'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Loader2, Mic, Send, SlidersHorizontal } from 'lucide-react';
import { buildRecipeCommandItems, type GlobalChatRecipe } from '@/lib/global-chat-ui';
import type { Folder, GlobalChatFilters, GlobalChatScope, Template } from '@/lib/types';

export interface GlobalChatSubmitPayload {
  displayText?: string;
  question?: string;
  templatePrompt?: string;
  templateId?: string;
  nextScope?: GlobalChatScope;
}

interface GlobalChatComposerProps {
  variant?: 'hero' | 'dock';
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (payload?: GlobalChatSubmitPayload) => void | Promise<void>;
  scope: GlobalChatScope;
  onScopeChange: (scope: GlobalChatScope) => void;
  filters: GlobalChatFilters;
  onFiltersChange: (filters: GlobalChatFilters) => void;
  templates: Template[];
  folders: Folder[];
  currentWorkspaceName?: string | null;
  disabled?: boolean;
  loading?: boolean;
  placeholder: string;
}

export default function GlobalChatComposer({
  variant = 'hero',
  input,
  onInputChange,
  onSubmit,
  scope,
  onScopeChange,
  filters,
  onFiltersChange,
  templates,
  folders,
  currentWorkspaceName,
  disabled = false,
  loading = false,
  placeholder,
}: GlobalChatComposerProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const dictationBaseRef = useRef('');
  const [showContext, setShowContext] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isDictating, setIsDictating] = useState(false);
  const [commandsDismissed, setCommandsDismissed] = useState(false);

  const commandQuery = input.startsWith('/') ? input.slice(1) : '';
  const showCommands = input.startsWith('/') && !commandsDismissed;
  const commandItems = useMemo(() => {
    const merged = buildRecipeCommandItems(templates);
    const q = commandQuery.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter((item) =>
      [item.label, item.description, item.command]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [commandQuery, templates]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const resizeInput = useCallback(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    resizeInput();
  }, [input, resizeInput]);

  const stopDictation = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsDictating(false);
  }, []);

  const toggleDictation = useCallback(() => {
    if (isDictating) {
      stopDictation();
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('当前浏览器不支持语音输入，请使用 Chrome');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    dictationBaseRef.current = input ? `${input.trim()} ` : '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let index = event.resultIndex; index < event.results.length; index++) {
        transcript += event.results[index][0].transcript;
      }
      onInputChange(`${dictationBaseRef.current}${transcript.trim()}`.trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Global chat dictation error:', event.error);
      if (event.error === 'not-allowed') {
        alert('请允许麦克风权限以使用语音输入');
      }
      stopDictation();
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsDictating(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsDictating(true);
  }, [input, onInputChange, isDictating, stopDictation]);

  const handleTextChange = (value: string) => {
    if (!value.startsWith('/')) {
      setCommandsDismissed(false);
    } else {
      if (value !== input) {
        setCommandsDismissed(false);
      }
      if (!input.startsWith('/')) {
        setSelectedIdx(0);
      }
    }

    onInputChange(value);
  };

  const selectRecipe = async (recipe: GlobalChatRecipe) => {
    onScopeChange(recipe.scope);
    onInputChange('');
    setCommandsDismissed(false);
    await onSubmit({
      displayText: recipe.title,
      question: recipe.prompt,
      nextScope: recipe.scope,
    });
  };

  const selectTemplate = async (template: Template) => {
    onInputChange('');
    setCommandsDismissed(false);
    await onSubmit({
      displayText: template.name,
      question: template.name,
      templatePrompt: template.prompt,
      templateId: template.id,
    });
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommands && commandItems.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, commandItems.length - 1));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        const selected = commandItems[Math.min(selectedIdx, Math.max(commandItems.length - 1, 0))];
        if (!selected) return;
        if (selected.type === 'recipe') {
          await selectRecipe(selected.recipe);
        } else {
          await selectTemplate(selected.template);
        }
        return;
      }

      if (event.key === 'Escape') {
        setCommandsDismissed(true);
        return;
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await onSubmit();
    }
  };

  const cardClassName =
    variant === 'hero'
      ? 'rounded-[28px] border border-[#D8CEC4] bg-white p-4 shadow-[0_12px_36px_rgba(58,46,37,0.08)]'
      : 'rounded-[24px] border border-[#D8CEC4] bg-white p-3 shadow-[0_12px_30px_rgba(58,46,37,0.08)]';
  const activeCommandIdx = Math.min(selectedIdx, Math.max(commandItems.length - 1, 0));

  return (
    <div className="relative">
      <div className={cardClassName}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-[#E3D9CE] bg-[#F8F4EF] p-1 text-[12px]">
            <button
              type="button"
              onClick={() => onScopeChange('my_notes')}
              className={`rounded-full px-3 py-1.5 transition-all ${
                scope === 'my_notes'
                  ? 'bg-white text-[#3A2E25] shadow-sm'
                  : 'text-[#8C7A6B]'
              }`}
            >
              我的笔记
            </button>
            <button
              type="button"
              onClick={() => onScopeChange('all_meetings')}
              className={`rounded-full px-3 py-1.5 transition-all ${
                scope === 'all_meetings'
                  ? 'bg-white text-[#3A2E25] shadow-sm'
                  : 'text-[#8C7A6B]'
              }`}
            >
              全部会议
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowContext((value) => !value)}
            className="inline-flex items-center gap-1 rounded-full border border-[#E3D9CE] bg-[#FBF8F4] px-3 py-1.5 text-[12px] text-[#6B5C50] transition-colors hover:bg-white"
          >
            <SlidersHorizontal size={13} />
            Add context
            <ChevronDown size={12} />
          </button>

          {scope === 'my_notes' && currentWorkspaceName ? (
            <span className="rounded-full bg-[#F1EBE3] px-3 py-1.5 text-[12px] text-[#8C7A6B]">
              当前工作区：{currentWorkspaceName}
            </span>
          ) : null}
        </div>

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => handleTextChange(event.target.value)}
            onKeyDown={(event) => {
              void handleKeyDown(event);
            }}
            placeholder={placeholder}
            disabled={disabled || loading}
            rows={1}
            className="min-h-[72px] flex-1 resize-none bg-transparent px-2 py-2 text-[16px] leading-7 text-[#3A2E25] placeholder:text-[#B4A79A] focus:outline-none disabled:opacity-50"
          />

          <button
            type="button"
            onClick={toggleDictation}
            disabled={disabled || loading}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all ${
              isDictating
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-[#F7F3EE] text-[#8C7A6B] hover:bg-sky-50 hover:text-sky-500'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <Mic size={18} />
          </button>

          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={disabled || loading || !input.trim()}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all ${
              input.trim() && !loading && !disabled
                ? 'bg-[#3A2E25] text-white shadow-md hover:bg-[#2B2420]'
                : 'bg-[#F7F3EE] text-[#B4A79A]'
            }`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      {showContext && (
        <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-20 rounded-[24px] border border-[#E3D9CE] bg-[#FCFAF7] p-4 shadow-[0_22px_48px_rgba(58,46,37,0.14)]">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[12px] text-[#8C7A6B]">
              标题关键词
              <input
                value={filters.titleKeyword || ''}
                onChange={(event) =>
                  onFiltersChange({ ...filters, titleKeyword: event.target.value })
                }
                placeholder="例如：复盘、面试、周会"
                className="mt-1.5 w-full rounded-xl border border-[#E3D9CE] bg-white px-3 py-2.5 text-sm text-[#3A2E25] focus:border-[#BFAE9E] focus:outline-none"
              />
            </label>
            <label className="text-[12px] text-[#8C7A6B]">
              文件夹
              <select
                value={filters.folderId || ''}
                onChange={(event) =>
                  onFiltersChange({ ...filters, folderId: event.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-[#E3D9CE] bg-white px-3 py-2.5 text-sm text-[#3A2E25] focus:border-[#BFAE9E] focus:outline-none"
              >
                <option value="">全部会议</option>
                <option value="__ungrouped">未分组</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[12px] text-[#8C7A6B]">
              开始日期
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(event) =>
                  onFiltersChange({ ...filters, dateFrom: event.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-[#E3D9CE] bg-white px-3 py-2.5 text-sm text-[#3A2E25] focus:border-[#BFAE9E] focus:outline-none"
              />
            </label>
            <label className="text-[12px] text-[#8C7A6B]">
              结束日期
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(event) =>
                  onFiltersChange({ ...filters, dateTo: event.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-[#E3D9CE] bg-white px-3 py-2.5 text-sm text-[#3A2E25] focus:border-[#BFAE9E] focus:outline-none"
              />
            </label>
          </div>
        </div>
      )}

      {showCommands && (
        <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-30 overflow-hidden rounded-[24px] border border-[#E3D9CE] bg-white shadow-[0_24px_60px_rgba(58,46,37,0.16)]">
          <div className="border-b border-[#EFE7DE] px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#A69B8F]">
            Skills & Recipes
          </div>
          <div className="max-h-[320px] overflow-y-auto p-2">
            {commandItems.length === 0 ? (
              <div className="px-4 py-6 text-sm text-[#A69B8F]">没有匹配的技能</div>
            ) : (
              commandItems.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => {
                    void (item.type === 'recipe'
                      ? selectRecipe(item.recipe)
                      : selectTemplate(item.template));
                  }}
                  className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                    index === activeCommandIdx ? 'bg-[#F7F3EE]' : 'hover:bg-[#FBF8F4]'
                  }`}
                >
                  <div
                    className={`mt-0.5 h-8 w-1.5 rounded-full ${
                      item.accent === 'lime'
                        ? 'bg-lime-400'
                        : item.accent === 'sky'
                          ? 'bg-sky-400'
                          : item.accent === 'violet'
                            ? 'bg-violet-400'
                            : 'bg-amber-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-[#3A2E25]">
                        {item.label}
                      </span>
                      {item.type === 'template' && item.command ? (
                        <code className="rounded-md bg-[#F7F3EE] px-1.5 py-0.5 text-[10px] text-[#8C7A6B]">
                          {item.command}
                        </code>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[12px] leading-5 text-[#8C7A6B]">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
