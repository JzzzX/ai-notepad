import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildGlobalChatSessionTitle, parseStoredGlobalChatFilters, serializeGlobalChatFilters } from '@/lib/global-chat-ui';
import type { GlobalChatFilters, GlobalChatScope } from '@/lib/types';

function normalizeScope(value: unknown): GlobalChatScope {
  return value === 'all_meetings' ? 'all_meetings' : 'my_notes';
}

export async function GET() {
  const sessions = await prisma.globalChatSession.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 20,
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
  });

  return NextResponse.json(
    sessions.map((session) => ({
      id: session.id,
      title: session.title,
      scope: session.scope,
      workspaceId: session.workspaceId,
      workspace: session.workspace,
      filters: parseStoredGlobalChatFilters(session.filters),
      updatedAt: session.updatedAt.toISOString(),
      createdAt: session.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    title?: string;
    scope?: GlobalChatScope;
    workspaceId?: string | null;
    filters?: GlobalChatFilters;
  };

  const scope = normalizeScope(body.scope);
  const title = buildGlobalChatSessionTitle(body.title || '');

  const session = await prisma.globalChatSession.create({
    data: {
      title,
      scope,
      workspaceId: scope === 'my_notes' ? body.workspaceId || null : null,
      filters: serializeGlobalChatFilters(body.filters || {}),
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
  });

  return NextResponse.json({
    id: session.id,
    title: session.title,
    scope: session.scope,
    workspaceId: session.workspaceId,
    workspace: session.workspace,
    filters: parseStoredGlobalChatFilters(session.filters),
    updatedAt: session.updatedAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
  });
}
