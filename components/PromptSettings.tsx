'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useMeetingStore } from '@/lib/store';
import type { MeetingType, OutputStyle } from '@/lib/types';

const MEETING_TYPES: MeetingType[] = ['通用', '项目周会', '需求评审', '销售沟通', '面试复盘'];
const OUTPUT_STYLES: OutputStyle[] = ['简洁', '平衡', '详细', '行动导向'];

export default function PromptSettings() {
  const { promptOptions, setPromptOptions } = useMeetingStore();

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
        <SlidersHorizontal size={13} className="text-zinc-400" />
        AI 输出设置
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs text-zinc-500">会议类型</span>
          <select
            value={promptOptions.meetingType}
            onChange={(e) =>
              setPromptOptions({ meetingType: e.target.value as MeetingType })
            }
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none"
          >
            {MEETING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-zinc-500">输出风格</span>
          <select
            value={promptOptions.outputStyle}
            onChange={(e) =>
              setPromptOptions({ outputStyle: e.target.value as OutputStyle })
            }
            className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none"
          >
            {OUTPUT_STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-xs text-zinc-600">
        <input
          type="checkbox"
          checked={promptOptions.includeActionItems}
          onChange={(e) => setPromptOptions({ includeActionItems: e.target.checked })}
          className="h-3.5 w-3.5 rounded border-zinc-300"
        />
        输出行动项（负责人 + 截止日期）
      </label>
    </div>
  );
}
