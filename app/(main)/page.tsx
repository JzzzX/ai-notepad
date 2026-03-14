'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileAudio, MessageSquare, Mic, Plus } from 'lucide-react';
import WorkspaceModal from '@/components/WorkspaceModal';
import { useMeetingStore } from '@/lib/store';

function buildGreeting() {
  const now = new Date();
  const hour = now.getHours();

  if (hour < 6) return '夜深了';
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function buildDateLabel() {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

export default function HomePage() {
  const router = useRouter();
  const {
    workspaces,
    currentWorkspaceId,
    loadWorkspaces,
    createWorkspace,
    setCurrentWorkspaceId,
    loadFolders,
  } = useMeetingStore();

  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  const currentWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === currentWorkspaceId) || null,
    [currentWorkspaceId, workspaces]
  );

  const handleNewMeeting = useCallback(() => {
    const { reset } = useMeetingStore.getState();
    reset();
    const newId = useMeetingStore.getState().meetingId;
    router.push(`/meeting/${newId}`);
  }, [router]);

  const handleImportAudio = useCallback(() => {
    const { reset } = useMeetingStore.getState();
    reset();
    const newId = useMeetingStore.getState().meetingId;
    router.push(`/meeting/${newId}?intent=upload`);
  }, [router]);

  const handleSaveWorkspace = useCallback(
    async (input: { name: string; description: string; color: string; icon: string }) => {
      const workspace = await createWorkspace(input);
      setCurrentWorkspaceId(workspace.id);
      await loadFolders();
      setShowCreateWorkspace(false);
      router.push(`/workspace/${workspace.id}`);
    },
    [createWorkspace, loadFolders, router, setCurrentWorkspaceId]
  );

  const handleOpenWorkspace = useCallback(() => {
    if (currentWorkspace) {
      router.push(`/workspace/${currentWorkspace.id}`);
      return;
    }
    setShowCreateWorkspace(true);
  }, [currentWorkspace, router]);

  const shortcuts = [
    {
      title: '开始录音',
      description: '新建一场会议并立刻进入记录。',
      icon: Mic,
      onClick: handleNewMeeting,
    },
    {
      title: '导入音频',
      description: '上传已有录音并直接转写。',
      icon: FileAudio,
      onClick: handleImportAudio,
    },
    {
      title: 'AI 对话',
      description: '围绕历史会议发起全局提问。',
      icon: MessageSquare,
      onClick: () => router.push('/chat'),
    },
    {
      title: currentWorkspace ? '进入当前工作区' : '创建工作区',
      description: currentWorkspace
        ? `继续管理 ${currentWorkspace.name} 下的会议与笔记历史。`
        : '先创建一个工作区，再开始沉淀会议资料。',
      icon: currentWorkspace ? Plus : Plus,
      onClick: handleOpenWorkspace,
    },
  ];

  return (
    <div className="min-h-full bg-[#F6F2EB]">
      <div className="mx-auto flex max-w-[980px] flex-col gap-8 px-6 pb-12 pt-12 sm:px-8 lg:px-10">
        <section className="rounded-[34px] border border-[#DED4C9] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.94),_rgba(249,244,237,0.98)_58%,_rgba(239,231,221,1))] px-6 py-8 text-center shadow-[0_24px_72px_rgba(58,46,37,0.08)] sm:px-10 sm:py-10">
          <p className="text-sm text-[#8B796A]">{buildDateLabel()}</p>
          <h1 className="mt-3 font-song text-[38px] leading-tight text-[#3A2E25] sm:text-[52px]">
            {buildGreeting()}，今天先从哪里开始？
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] leading-7 text-[#7C6B5C]">
            首页现在只负责迎接你进入 Piedras。会议历史和笔记管理已经移到独立工作区里。
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={item.onClick}
              className="rounded-[26px] border border-[#E7DDD2] bg-white/90 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#D9CCBF] hover:shadow-[0_16px_32px_rgba(58,46,37,0.08)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EEE5] text-[#5E4E43]">
                <item.icon size={19} />
              </div>
              <div className="mt-4 text-[16px] font-semibold text-[#3A2E25]">{item.title}</div>
              <div className="mt-1 text-sm leading-6 text-[#8B796A]">{item.description}</div>
            </button>
          ))}
        </section>
      </div>

      <WorkspaceModal
        open={showCreateWorkspace}
        mode="create"
        onClose={() => setShowCreateWorkspace(false)}
        onSubmit={handleSaveWorkspace}
      />
    </div>
  );
}
