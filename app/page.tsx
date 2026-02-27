'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Mic, RotateCcw, Save, Check, History } from 'lucide-react';
import AudioRecorder from '@/components/AudioRecorder';
import TranscriptPanel from '@/components/TranscriptPanel';
import NoteEditor from '@/components/NoteEditor';
import ChatPanel from '@/components/ChatPanel';
import EnhancedNotes from '@/components/EnhancedNotes';
import SpeakerManager from '@/components/SpeakerManager';
import MeetingHistory from '@/components/MeetingHistory';
import PromptSettings from '@/components/PromptSettings';
import { useMeetingStore } from '@/lib/store';

export default function Home() {
  const {
    meetingTitle,
    setMeetingTitle,
    status,
    reset,
    segments,
    isSaving,
    saveMeeting,
    loadMeetingList,
  } = useMeetingStore();

  const prevStatusRef = useRef(status);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 录音结束时自动保存
  useEffect(() => {
    if (prevStatusRef.current === 'recording' && status === 'ended') {
      saveMeeting().then(() => loadMeetingList());
    }
    prevStatusRef.current = status;
  }, [status, saveMeeting, loadMeetingList]);

  // 录音中每 30 秒自动保存
  useEffect(() => {
    if (status === 'recording') {
      autoSaveTimerRef.current = setInterval(() => {
        saveMeeting();
      }, 30000);
    } else {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [status, saveMeeting]);

  // 手动保存
  const handleSave = useCallback(async () => {
    await saveMeeting();
    await loadMeetingList();
  }, [saveMeeting, loadMeetingList]);

  // 新会议
  const handleNewMeeting = useCallback(async () => {
    // 先保存当前会议（如果有内容）
    const state = useMeetingStore.getState();
    if (state.segments.length > 0 || state.userNotes || state.enhancedNotes) {
      await saveMeeting();
    }
    reset();
    await loadMeetingList();
  }, [saveMeeting, reset, loadMeetingList]);

  const hasContent = segments.length > 0;

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      {/* 顶栏 */}
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
            <Mic size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-800">AI Notepad</h1>
            <p className="text-xs text-zinc-400">智能会议笔记助手</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="输入会议标题..."
            className="w-64 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none transition-colors"
          />

          <AudioRecorder />

          {/* 保存按钮 */}
          {hasContent && status !== 'recording' && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 disabled:opacity-50"
              title="保存会议"
            >
              {isSaving ? (
                <Save size={12} className="animate-pulse" />
              ) : (
                <Check size={12} />
              )}
              {isSaving ? '保存中...' : '保存'}
            </button>
          )}

          {status === 'ended' && (
            <button
              onClick={handleNewMeeting}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700"
            >
              <RotateCcw size={12} />
              新会议
            </button>
          )}
        </div>
      </header>

      {/* 主体 */}
      <main className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 - 会议历史 */}
        <div className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-2.5">
            <History size={14} className="text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-600">会议记录</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <MeetingHistory />
          </div>
        </div>

        {/* 左栏 - 实时转写 */}
        <div className="flex flex-1 flex-col border-r border-zinc-200 bg-white">
          <TranscriptPanel />
        </div>

        {/* 中栏 - 笔记编辑器 + AI 笔记 */}
        <div className="flex flex-1 flex-col border-r border-zinc-200 bg-white">
          <div className="flex-1 overflow-y-auto">
            <NoteEditor />
          </div>

          {(status === 'ended' || segments.length > 0) && (
            <div className="border-t border-zinc-200 bg-zinc-50 p-4 space-y-4 max-h-[50%] overflow-y-auto">
              <PromptSettings />
              <SpeakerManager />
              <EnhancedNotes />
            </div>
          )}
        </div>

        {/* 右栏 - Chat */}
        <div className="flex flex-1 flex-col bg-white">
          <ChatPanel />
        </div>
      </main>

      {/* 底栏状态 */}
      <footer className="flex items-center justify-between border-t border-zinc-200 bg-white px-5 py-2">
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span>
            {status === 'idle' && '准备就绪 — Botless 双通道采集'}
            {status === 'recording' && '正在录音 — 无 Bot 进入会议 · 每30s自动保存'}
            {status === 'ended' && '录音已结束 — 已自动保存'}
          </span>
          {segments.length > 0 && (
            <span>{segments.length} 条转写</span>
          )}
          {isSaving && (
            <span className="flex items-center gap-1 text-amber-500">
              <Save size={10} className="animate-pulse" />
              保存中...
            </span>
          )}
        </div>
        <div className="text-xs text-zinc-300">
          Botless 模式 · 麦克风 + 系统音频 · 数据存储在本地 SQLite
        </div>
      </footer>
    </div>
  );
}
