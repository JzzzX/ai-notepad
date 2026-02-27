'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, Clock } from 'lucide-react';
import { useMeetingStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

export default function AudioRecorder() {
  const {
    status,
    duration,
    startMeeting,
    endMeeting,
    addSegment,
    setCurrentPartial,
    updateDuration,
  } = useMeetingStore();

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakerCountRef = useRef(0);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStart = useCallback(() => {
    startMeeting();

    timerRef.current = setInterval(() => {
      updateDuration();
    }, 1000);

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      alert('当前浏览器不支持语音识别，请使用 Chrome 浏览器');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;

      if (result.isFinal) {
        speakerCountRef.current++;
        const speakerId =
          speakerCountRef.current % 3 === 0
            ? 'Speaker C'
            : speakerCountRef.current % 2 === 0
              ? 'Speaker B'
              : 'Speaker A';

        addSegment({
          id: uuidv4(),
          speaker: speakerId,
          text: text.trim(),
          startTime: Date.now() - 2000,
          endTime: Date.now(),
          isFinal: true,
        });
      } else {
        setCurrentPartial(text);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('请允许麦克风权限以使用语音转写功能');
      }
    };

    recognition.onend = () => {
      if (useMeetingStore.getState().status === 'recording') {
        try {
          recognition.start();
        } catch {
          // ignore
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [startMeeting, updateDuration, addSegment, setCurrentPartial]);

  const handleStop = useCallback(() => {
    endMeeting();

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [endMeeting]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      {status === 'idle' || status === 'ended' ? (
        <button
          onClick={handleStart}
          className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600 active:scale-95"
        >
          <Mic size={16} />
          开始录音
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <Clock size={14} />
            <span className="font-mono">{formatDuration(duration)}</span>
          </div>
          <button
            onClick={handleStop}
            className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-zinc-900 active:scale-95"
          >
            <Square size={14} />
            结束录音
          </button>
        </>
      )}

      {status === 'recording' && (
        <span className="text-xs text-zinc-400">
          <MicOff size={12} className="mr-1 inline" />
          浏览器语音识别（Demo）
        </span>
      )}
    </div>
  );
}
