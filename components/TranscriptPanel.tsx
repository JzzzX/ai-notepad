'use client';

import { useEffect, useRef } from 'react';
import { useMeetingStore } from '@/lib/store';
import { MessageSquare, User } from 'lucide-react';

const SPEAKER_COLORS: Record<string, string> = {
  'Speaker A': 'bg-blue-50 border-blue-200 text-blue-900',
  'Speaker B': 'bg-green-50 border-green-200 text-green-900',
  'Speaker C': 'bg-purple-50 border-purple-200 text-purple-900',
  'Speaker D': 'bg-orange-50 border-orange-200 text-orange-900',
};

const SPEAKER_DOT_COLORS: Record<string, string> = {
  'Speaker A': 'bg-blue-400',
  'Speaker B': 'bg-green-400',
  'Speaker C': 'bg-purple-400',
  'Speaker D': 'bg-orange-400',
};

export default function TranscriptPanel() {
  const { segments, currentPartial, status, speakers } = useMeetingStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments, currentPartial]);

  const getSpeakerDisplayName = (speaker: string) => {
    return speakers[speaker] || speaker;
  };

  if (status === 'idle') {
    return (
      <div className="flex h-full flex-col items-center justify-center text-zinc-400">
        <MessageSquare size={48} strokeWidth={1} className="mb-4 opacity-50" />
        <p className="text-sm font-medium">实时转写</p>
        <p className="mt-1 text-xs">点击「开始录音」后，转写内容将在这里显示</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2">
        <h3 className="text-sm font-semibold text-zinc-700">实时转写</h3>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
          {segments.length} 条
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {segments.map((seg) => {
          const colorClass = SPEAKER_COLORS[seg.speaker] || 'bg-zinc-50 border-zinc-200 text-zinc-900';
          const dotColor = SPEAKER_DOT_COLORS[seg.speaker] || 'bg-zinc-400';

          return (
            <div
              key={seg.id}
              className={`rounded-lg border p-3 transition-all ${colorClass}`}
            >
              <div className="mb-1 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                <span className="text-xs font-medium">
                  {getSpeakerDisplayName(seg.speaker)}
                </span>
                <span className="text-xs opacity-50">
                  {new Date(seg.startTime).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{seg.text}</p>
            </div>
          );
        })}

        {/* 正在说的临时文字 */}
        {currentPartial && status === 'recording' && (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3">
            <div className="mb-1 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
              <span className="text-xs font-medium text-zinc-500">识别中...</span>
            </div>
            <p className="text-sm text-zinc-500 italic">{currentPartial}</p>
          </div>
        )}

        {/* 录音中但无内容时的提示 */}
        {segments.length === 0 && !currentPartial && status === 'recording' && (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
            <div className="mb-3 flex gap-1">
              <div className="h-3 w-1 animate-pulse rounded bg-red-300" style={{ animationDelay: '0ms' }} />
              <div className="h-4 w-1 animate-pulse rounded bg-red-400" style={{ animationDelay: '150ms' }} />
              <div className="h-5 w-1 animate-pulse rounded bg-red-500" style={{ animationDelay: '300ms' }} />
              <div className="h-4 w-1 animate-pulse rounded bg-red-400" style={{ animationDelay: '150ms' }} />
              <div className="h-3 w-1 animate-pulse rounded bg-red-300" style={{ animationDelay: '0ms' }} />
            </div>
            <p className="text-xs">正在聆听...</p>
          </div>
        )}
      </div>

      {/* 说话人图例 */}
      {segments.length > 0 && (
        <div className="border-t border-zinc-100 px-4 py-2">
          <div className="flex flex-wrap gap-3">
            {Object.keys(
              segments.reduce(
                (acc, s) => ({ ...acc, [s.speaker]: true }),
                {} as Record<string, boolean>
              )
            ).map((speaker) => {
              const dotColor = SPEAKER_DOT_COLORS[speaker] || 'bg-zinc-400';
              return (
                <div key={speaker} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                  <User size={10} />
                  <span>{getSpeakerDisplayName(speaker)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
