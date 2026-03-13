'use client';

import { useEffect, useState } from 'react';
import type { Template } from '@/lib/types';
import { TEMPLATE_CATEGORIES } from '@/lib/templates';
import { ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';

interface TemplateForm {
  name: string;
  command: string;
  icon: string;
  description: string;
  prompt: string;
  category: string;
}

const DEFAULT_FORM: TemplateForm = {
  name: '',
  command: '',
  icon: '📝',
  description: '',
  prompt: '',
  category: '记录',
};

function toForm(template: Template): TemplateForm {
  return {
    name: template.name,
    command: template.command,
    icon: template.icon,
    description: template.description,
    prompt: template.prompt,
    category: template.category,
  };
}

export default function TemplateManagerInline() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<TemplateForm>(DEFAULT_FORM);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => { void loadTemplates(); }, []);

  const selected = templates.find((t) => t.id === selectedId);

  const handleSelect = (t: Template) => {
    setSelectedId(t.id);
    setForm(toForm(t));
    setIsCreating(false);
    setError('');
  };

  const handleNew = () => {
    setSelectedId(null);
    setForm(DEFAULT_FORM);
    setIsCreating(true);
    setError('');
  };

  const handleSave = async () => {
    setIsBusy(true);
    setError('');
    try {
      const method = isCreating ? 'POST' : 'PUT';
      const url = isCreating ? '/api/templates' : `/api/templates/${selectedId}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '保存失败');
      }
      await loadTemplates();
      if (isCreating) {
        const data = await res.json().catch(() => null);
        if (data?.id) setSelectedId(data.id);
        setIsCreating(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !window.confirm('确定删除这个模板？')) return;
    setIsBusy(true);
    try {
      await fetch(`/api/templates/${selectedId}`, { method: 'DELETE' });
      setSelectedId(null);
      setForm(DEFAULT_FORM);
      setIsCreating(false);
      await loadTemplates();
    } finally {
      setIsBusy(false);
    }
  };

  const reorder = async (id: string, direction: 'up' | 'down') => {
    const idx = templates.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= templates.length) return;
    const ordered = [...templates];
    [ordered[idx], ordered[swapIdx]] = [ordered[swapIdx], ordered[idx]];
    setTemplates(ordered);
    await fetch('/api/templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: ordered.map((t) => t.id) }),
    });
  };

  return (
    <div className="flex gap-4 min-h-[400px]">
      {/* Sidebar list */}
      <div className="w-48 shrink-0 space-y-1 rounded-2xl border border-[#E3D9CE] bg-[#FCFAF8] p-2">
        {templates.map((t) => (
          <div key={t.id} className="group relative">
            <button
              onClick={() => handleSelect(t)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-all ${
                t.id === selectedId ? 'bg-white shadow-sm font-medium text-[#3A2E25]' : 'text-[#5C4D42] hover:bg-[#F7F3EE]'
              }`}
            >
              <span>{t.icon}</span>
              <span className="truncate">{t.name}</span>
            </button>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
              <button onClick={() => reorder(t.id, 'up')} className="rounded p-0.5 text-[#8C7A6B] hover:bg-[#EFE9E2]"><ChevronUp size={11} /></button>
              <button onClick={() => reorder(t.id, 'down')} className="rounded p-0.5 text-[#8C7A6B] hover:bg-[#EFE9E2]"><ChevronDown size={11} /></button>
            </span>
          </div>
        ))}
        <button
          onClick={handleNew}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#8C7A6B] hover:bg-[#F7F3EE]"
        >
          <Plus size={14} />
          新建模板
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 space-y-4">
        {!selectedId && !isCreating ? (
          <div className="flex h-full items-center justify-center text-sm text-[#A69B8F]">
            选择或新建一个模板
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs text-[#8C7A6B]">名称</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-[#D8CEC4] bg-white px-3 py-2 text-sm text-[#3A2E25] focus:outline-none focus:ring-1 focus:ring-[#D8CEC4]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-[#8C7A6B]">命令</span>
                <input
                  value={form.command}
                  onChange={(e) => setForm({ ...form, command: e.target.value })}
                  className="w-full rounded-xl border border-[#D8CEC4] bg-white px-3 py-2 text-sm text-[#3A2E25] focus:outline-none focus:ring-1 focus:ring-[#D8CEC4]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-[#8C7A6B]">图标</span>
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full rounded-xl border border-[#D8CEC4] bg-white px-3 py-2 text-sm text-[#3A2E25] focus:outline-none focus:ring-1 focus:ring-[#D8CEC4]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-[#8C7A6B]">分类</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-[#D8CEC4] bg-white px-3 py-2 text-sm text-[#3A2E25] focus:outline-none focus:ring-1 focus:ring-[#D8CEC4]"
                >
                  {TEMPLATE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-xs text-[#8C7A6B]">描述</span>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-[#D8CEC4] bg-white px-3 py-2 text-sm text-[#3A2E25] focus:outline-none focus:ring-1 focus:ring-[#D8CEC4]"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-[#8C7A6B]">Prompt</span>
              <textarea
                value={form.prompt}
                onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                rows={6}
                className="w-full resize-y rounded-xl border border-[#D8CEC4] bg-white px-3 py-2 text-sm text-[#3A2E25] focus:outline-none focus:ring-1 focus:ring-[#D8CEC4]"
                style={{ minHeight: '160px' }}
              />
            </label>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isBusy}
                className="rounded-xl bg-[#4A3C31] px-4 py-2 text-sm font-medium text-white hover:bg-[#3A2E25] disabled:opacity-50"
              >
                {isBusy ? '保存中...' : '保存'}
              </button>
              {selectedId && selected && !selected.isSystem && (
                <button
                  onClick={handleDelete}
                  disabled={isBusy}
                  className="flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  删除
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
