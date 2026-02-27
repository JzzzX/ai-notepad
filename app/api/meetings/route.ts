import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/meetings — 获取会议列表
export async function GET() {
  const meetings = await prisma.meeting.findMany({
    orderBy: { date: 'desc' },
    select: {
      id: true,
      title: true,
      date: true,
      status: true,
      duration: true,
      createdAt: true,
      _count: { select: { segments: true, chatMessages: true } },
    },
  });
  return NextResponse.json(meetings);
}

// POST /api/meetings — 创建或保存会议
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    id,
    title,
    date,
    status,
    duration,
    userNotes,
    enhancedNotes,
    speakers,
    segments,
    chatMessages,
  } = body;

  // upsert: 有 id 就更新，没有就创建
  const meeting = await prisma.meeting.upsert({
    where: { id: id || '' },
    create: {
      id,
      title: title || '',
      date: new Date(date),
      status: status || 'ended',
      duration: duration || 0,
      userNotes: userNotes || '',
      enhancedNotes: enhancedNotes || '',
      speakers: JSON.stringify(speakers || {}),
      segments: {
        create: (segments || []).map(
          (s: { id: string; speaker: string; text: string; startTime: number; endTime: number; isFinal: boolean }, i: number) => ({
            id: s.id,
            speaker: s.speaker,
            text: s.text,
            startTime: s.startTime,
            endTime: s.endTime,
            isFinal: s.isFinal,
            order: i,
          })
        ),
      },
      chatMessages: {
        create: (chatMessages || []).map(
          (m: { id: string; role: string; content: string; timestamp: number; templateId?: string }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            templateId: m.templateId || null,
          })
        ),
      },
    },
    update: {
      title: title || '',
      date: new Date(date),
      status: status || 'ended',
      duration: duration || 0,
      userNotes: userNotes || '',
      enhancedNotes: enhancedNotes || '',
      speakers: JSON.stringify(speakers || {}),
    },
  });

  return NextResponse.json(meeting);
}
