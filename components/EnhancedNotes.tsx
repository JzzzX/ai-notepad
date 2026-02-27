'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, FileDown } from 'lucide-react';
import { useMeetingStore } from '@/lib/store';
import { enhanceNotes } from '@/lib/llm';

export default function EnhancedNotes() {
  const {
    segments,
    userNotes,
    meetingTitle,
    enhancedNotes,
    isEnhancing,
    speakers,
    status,
    setEnhancedNotes,
    setIsEnhancing,
  } = useMeetingStore();

  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    try {
      const result = await enhanceNotes(
        segments,
        userNotes,
        meetingTitle,
        speakers
      );
      setEnhancedNotes(result);
    } catch (error) {
      console.error('Enhance error:', error);
      setEnhancedNotes('生成失败，请稍后重试。');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(enhancedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([enhancedNotes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meetingTitle || '会议纪要'}_${new Date().toLocaleDateString('zh-CN')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canGenerate = status === 'ended' || segments.length > 0;

  if (!enhancedNotes && !isEnhancing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:shadow-none"
        >
          <Sparkles size={16} />
          AI 生成结构化笔记
        </button>
        {!canGenerate && (
          <p className="text-xs text-zinc-400">录音结束后可生成 AI 笔记</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isEnhancing ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-amber-500 mb-3" />
          <p className="text-sm text-zinc-500">AI 正在融合转写与笔记...</p>
          <p className="text-xs text-zinc-400 mt-1">
            将你的要点与转写内容结合，生成结构化纪要
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700">
              <Sparkles size={14} className="text-amber-500" />
              AI 会议纪要
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                title="复制"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
              <button
                onClick={handleExport}
                className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                title="导出 Markdown"
              >
                <FileDown size={14} />
              </button>
              <button
                onClick={handleGenerate}
                className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                title="重新生成"
              >
                <Sparkles size={14} />
              </button>
            </div>
          </div>
          <div className="prose prose-sm prose-zinc max-w-none rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {enhancedNotes}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
