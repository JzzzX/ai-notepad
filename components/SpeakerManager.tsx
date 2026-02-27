'use client';

import { useState } from 'react';
import { useMeetingStore } from '@/lib/store';
import { UserCircle, Check, X, Edit3 } from 'lucide-react';

export default function SpeakerManager() {
  const { segments, speakers, setSpeakerName } = useMeetingStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // 获取所有出现过的说话人
  const uniqueSpeakers = Array.from(
    new Set(segments.map((s) => s.speaker))
  );

  if (uniqueSpeakers.length === 0) return null;

  const startEdit = (speakerId: string) => {
    setEditing(speakerId);
    setEditValue(speakers[speakerId] || '');
  };

  const saveEdit = () => {
    if (editing && editValue.trim()) {
      setSpeakerName(editing, editValue.trim());
    }
    setEditing(null);
    setEditValue('');
  };

  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
        <UserCircle size={12} />
        说话人管理
      </h4>
      <div className="flex flex-wrap gap-2">
        {uniqueSpeakers.map((speaker) => (
          <div
            key={speaker}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1"
          >
            {editing === speaker ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  placeholder="输入姓名"
                  className="w-16 border-none bg-transparent text-xs focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className="text-green-500 hover:text-green-700"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <>
                <span className="text-xs text-zinc-600">
                  {speakers[speaker] || speaker}
                </span>
                <button
                  onClick={() => startEdit(speaker)}
                  className="text-zinc-300 hover:text-zinc-500"
                >
                  <Edit3 size={10} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
