'use client';

import { useEffect } from 'react';
import { useMeetingStore, MeetingListItem } from '@/lib/store';
import { Clock, MessageSquare, FileText, Trash2, Loader2 } from 'lucide-react';

export default function MeetingHistory() {
  const {
    meetingList,
    isLoadingList,
    meetingId,
    loadMeetingList,
    loadMeeting,
    deleteMeeting,
  } = useMeetingStore();

  useEffect(() => {
    loadMeetingList();
  }, [loadMeetingList]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `今天 ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (isYesterday) {
      return `昨天 ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m${s > 0 ? `${s}s` : ''}`;
  };

  if (isLoadingList) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={16} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (meetingList.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-xs text-zinc-400">
        <FileText size={20} className="mx-auto mb-2 opacity-40" />
        <p>暂无会议记录</p>
        <p className="mt-1 text-zinc-300">录音结束后会自动保存</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {meetingList.map((m: MeetingListItem) => {
        const isActive = m.id === meetingId;
        return (
          <div
            key={m.id}
            onClick={() => loadMeeting(m.id)}
            className={`group flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
              isActive
                ? 'bg-amber-50 border border-amber-200'
                : 'hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  isActive ? 'text-amber-800' : 'text-zinc-700'
                }`}
              >
                {m.title || '未命名会议'}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                <span>{formatDate(m.date)}</span>
                {m.duration > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} />
                      {formatDuration(m.duration)}
                    </span>
                  </>
                )}
                {m._count.segments > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare size={10} />
                      {m._count.segments}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('确定删除这条会议记录？')) {
                  deleteMeeting(m.id);
                }
              }}
              className="mt-0.5 rounded p-1 text-zinc-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
              title="删除"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
