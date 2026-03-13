'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Plus, Sparkles, X } from 'lucide-react';

const PRESET_COLORS = ['#94a3b8', '#f87171', '#fb923c', '#fbbf24', '#4ade80', '#38bdf8', '#a78bfa', '#f472b6'];
const DEFAULT_COLOR = PRESET_COLORS[0];

interface WorkspaceDraft {
  name: string;
  description: string;
  color: string;
}

interface WorkspaceCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: WorkspaceDraft) => Promise<void>;
}

const DEFAULT_DRAFT: WorkspaceDraft = {
  name: '',
  description: '',
  color: DEFAULT_COLOR,
};

export default function WorkspaceCreateModal({
  open,
  onClose,
  onSubmit,
}: WorkspaceCreateModalProps) {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<WorkspaceDraft>(DEFAULT_DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setDraft(DEFAULT_DRAFT);
    setError('');
    setIsSubmitting(false);
  }, [open]);

  useEffect(() => {
    if (!open || !mounted) return;
    const frame = window.requestAnimationFrame(() => {
      nameInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mounted, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose, open]);

  const previewName = useMemo(() => draft.name.trim() || '新工作区', [draft.name]);
  const previewDescription = useMemo(
    () => draft.description.trim() || '用一句简短描述，帮助你快速识别这个工作区的用途。',
    [draft.description]
  );

  if (!open || !mounted) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!draft.name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        name: draft.name.trim(),
        description: draft.description.trim(),
        color: draft.color,
      });
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '创建工作区失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#2B2420]/26 p-4 backdrop-blur-sm sm:p-6">
      <button
        type="button"
        aria-label="关闭创建工作区弹窗"
        className="absolute inset-0 cursor-default"
        onClick={handleClose}
      />

      <div className="relative z-10 flex w-full max-w-[760px] flex-col overflow-hidden rounded-[32px] border border-[#E3D9CE]/70 bg-[#FCF9F5] shadow-[0_30px_80px_rgba(58,46,37,0.18)] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between border-b border-[#E8DED3] px-6 py-5 sm:px-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B29F8B]">Workspace</p>
            <h2 className="mt-2 font-song text-[24px] font-semibold text-[#3A2E25]">创建工作区</h2>
            <p className="mt-2 max-w-[460px] text-sm leading-6 text-[#7B6A5B]">
              把不同客户、项目或议题拆开管理。创建后会自动切换到新工作区，后续的会议、文件夹和 AI 问答都会在这里继续累积。
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-[#9D8B7B] transition-colors hover:bg-white/80 hover:text-[#5C4D42]"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 sm:px-7 lg:grid-cols-[minmax(0,1.2fr)_280px]">
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#5C4D42]">工作区名称</span>
              <input
                ref={nameInputRef}
                value={draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleSubmit();
                  }
                }}
                placeholder="例如：Acme 项目、候选人面试、政策研究"
                className="w-full rounded-2xl border border-[#D8CEC4] bg-white px-4 py-3 text-sm text-[#3A2E25] placeholder:text-[#AE9D8E] focus:border-[#C2B3A4] focus:outline-none focus:ring-4 focus:ring-[#EADFD3]/70"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#5C4D42]">描述</span>
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="这个工作区主要记录什么内容？例如：与 Acme 客户有关的销售通话、需求确认与周例会。"
                rows={4}
                className="w-full resize-none rounded-2xl border border-[#D8CEC4] bg-white px-4 py-3 text-sm leading-6 text-[#3A2E25] placeholder:text-[#AE9D8E] focus:border-[#C2B3A4] focus:outline-none focus:ring-4 focus:ring-[#EADFD3]/70"
              />
            </label>

            <div>
              <span className="mb-3 block text-sm font-medium text-[#5C4D42]">颜色</span>
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map((color) => {
                  const selected = draft.color === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, color }))}
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all ${
                        selected
                          ? 'border-[#5C4D42] bg-white shadow-sm ring-2 ring-[#E8DED3]'
                          : 'border-transparent bg-white/70 hover:border-[#D8CEC4] hover:bg-white'
                      }`}
                      aria-label={`选择颜色 ${color}`}
                    >
                      <span
                        className="h-7 w-7 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            ) : null}
          </div>

          <div className="rounded-[28px] border border-[#E8DED3] bg-white/80 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#B29F8B]">
              <Sparkles size={14} />
              侧边栏预览
            </div>

            <div className="mt-5 rounded-[24px] border border-[#E3D9CE] bg-white p-4 shadow-[0_10px_20px_rgba(58,46,37,0.08)]">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{ backgroundColor: draft.color }}
                />
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-[#3A2E25]">{previewName}</div>
                  <div className="mt-1 text-xs text-[#A09082]">会成为一个新的会议归档空间</div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#F7F3EE] px-4 py-3 text-sm leading-6 text-[#7B6A5B]">
                {previewDescription}
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#F4E7CB]/45 px-4 py-3 text-sm leading-6 text-[#7A6245]">
              创建后会自动切换过去，新的会议与文件夹都会优先落在这里。
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E8DED3] bg-white/60 px-6 py-4 sm:px-7">
          <div className="hidden items-center gap-2 text-sm text-[#9D8B7B] sm:flex">
            <Plus size={15} />
            用工作区把不同语境彻底分开
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-2xl px-4 py-2.5 text-sm font-medium text-[#8C7A6B] transition-colors hover:bg-[#F3ECE5] hover:text-[#5C4D42]"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!draft.name.trim() || isSubmitting}
              className="inline-flex min-w-[112px] items-center justify-center gap-2 rounded-2xl bg-[#4A3C31] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3A2E25] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isSubmitting ? '创建中...' : '创建工作区'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
