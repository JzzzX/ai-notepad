import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const folders = await prisma.folder.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return NextResponse.json(folders);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: string; color?: string };
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: '文件夹名称不能为空' }, { status: 400 });
    }

    const lastFolder = await prisma.folder.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const folder = await prisma.folder.create({
      data: {
        name,
        color: body.color?.trim() || '#94a3b8',
        sortOrder: (lastFolder?.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    const message = error instanceof Error ? error.message : '创建文件夹失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
