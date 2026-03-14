'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit3, FileAudio, FolderClosed, Mic } from 'lucide-react';
import MeetingHistory from '@/components/MeetingHistory';
import WorkspaceIconBadge from '@/components/WorkspaceIconBadge';
import WorkspaceModal from '@/components/WorkspaceModal';
import { useMeetingStore } from '@/lib/store';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const {
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    loadWorkspaces,
    loadFolders,
    loadMeetingList,
    updateWorkspace,
    meetingList,
    folders,
  } = useMeetingStore();

  const [showEditWorkspace, setShowEditWorkspace] = useState(false);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    if (!workspaceId) return;
    if (currentWorkspaceId !== workspaceId) {
      setCurrentWorkspaceId(workspaceId);
    }
  }, [currentWorkspaceId, setCurrentWorkspaceId, workspaceId]);

  useEffect(() => {
    if (!currentWorkspaceId) return;
    void loadFolders();
    void loadMeetingList({ workspaceScope: 'current' });
  }, [currentWorkspaceId, loadFolders, loadMeetingList]);

  const workspace = useMemo(
    () => workspaces.find((item) => item.id === workspaceId) || null,
    [workspaceId, workspaces]
  );

  useEffect(() => {
    if (workspaces.length > 0 && !workspace) {
      router.replace('/');
    }
  }, [router, workspace, workspaces.length]);

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
      if (!workspace) return;
      await updateWorkspace(workspace.id, input);
      setShowEditWorkspace(false);
    },
    [updateWorkspace, workspace]
  );

  return (
    <div className="min-h-full bg-[#F6F2EB]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-6 pb-10 pt-8 sm:px-8 lg:px-10">
        <section className="rounded-[30px] border border-[#DED4C9] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.94),_rgba(249,244,237,0.98)_58%,_rgba(239,231,221,1))] px-6 py-7 shadow-[0_24px_72px_rgba(58,46,37,0.08)] sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              {workspace ? (
                <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm text-[#6C5D50]">
                  <WorkspaceIconBadge
                    icon={workspace.icon}
                    color={workspace.color}
                    size="sm"
                  />
                  <span>工作区</span>
                </div>
              ) : null}
              <h1 className="mt-4 font-song text-[34px] leading-tight text-[#3A2E25] sm:text-[42px]">
                {workspace?.name || '工作区'}
              </h1>
              <p className="mt-3 max-w-[720px] text-[15px] leading-7 text-[#7C6B5C]">
                {workspace?.description || '管理这个工作区下的会议记录、AI 笔记和文件夹归档。'}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-[#8B796A]">
                <span className="rounded-full bg-white px-3 py-1.5">
                  会议 {meetingList.length} 条
                </span>
                <span className="rounded-full bg-white px-3 py-1.5">
                  文件夹 {folders.length} 个
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleNewMeeting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3A2E25] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2B2420]"
              >
                <Mic size={16} />
                新录音
              </button>
              <button
                type="button"
                onClick={handleImportAudio}
                className="inline-flex items-center gap-2 rounded-xl border border-[#D8CEC4] bg-white px-4 py-2.5 text-sm font-medium text-[#5C4D42] transition-colors hover:bg-[#FBF8F4]"
              >
                <FileAudio size={16} />
                导入音频
              </button>
              <button
                type="button"
                onClick={() => setShowEditWorkspace(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#D8CEC4] bg-white px-4 py-2.5 text-sm font-medium text-[#5C4D42] transition-colors hover:bg-[#FBF8F4]"
              >
                <Edit3 size={16} />
                编辑工作区
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-[#DED4C9] bg-white/90 p-4 shadow-[0_18px_48px_rgba(58,46,37,0.08)] sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
            <div>
              <h2 className="font-song text-[26px] text-[#3A2E25]">会议与笔记历史</h2>
              <p className="mt-1 text-sm text-[#8B796A]">
                按标题、时间和文件夹管理这个工作区下的会议记录，卡片会直接显示笔记预览。
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F4EF] px-3 py-2 text-[12px] text-[#8B796A]">
              <FolderClosed size={13} />
              文件夹管理已移动到这里
            </div>
          </div>

          <MeetingHistory />
        </section>
      </div>

      <WorkspaceModal
        open={showEditWorkspace}
        mode="edit"
        workspace={workspace}
        onClose={() => setShowEditWorkspace(false)}
        onSubmit={handleSaveWorkspace}
      />
    </div>
  );
}
