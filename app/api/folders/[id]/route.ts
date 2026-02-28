import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { name?: string; color?: string };

    const folder = await prisma.folder.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.color !== undefined ? { color: body.color.trim() || '#94a3b8' } : {}),
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新文件夹失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.$transaction([
      prisma.meeting.updateMany({
        where: { folderId: id },
        data: { folderId: null },
      }),
      prisma.folder.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除文件夹失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
