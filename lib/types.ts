export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
  isFinal: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  templateId?: string;
}

export interface Template {
  id: string;
  name: string;
  command: string;
  icon: string;
  description: string;
  prompt: string;
  category: '复盘' | '记录' | '分析' | '工具';
}

export interface Meeting {
  id: string;
  title: string;
  date: number;
  status: 'idle' | 'recording' | 'paused' | 'ended';
  segments: TranscriptSegment[];
  userNotes: string;
  enhancedNotes: string;
  speakers: Record<string, string>;
  chatMessages: ChatMessage[];
  duration: number;
}
