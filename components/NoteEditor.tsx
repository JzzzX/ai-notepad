'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useMeetingStore } from '@/lib/store';
import { FileText, Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';

export default function NoteEditor() {
  const { status, userNotes, setUserNotes } = useMeetingStore();

  const editor = useEditor({
    extensions: [StarterKit],
    content: userNotes || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm prose-zinc max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      setUserNotes(editor.getHTML());
    },
  });

  if (status === 'idle') {
    return (
      <div className="flex h-full flex-col bg-transparent">
        <div className="border-b border-black/[0.04] px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="font-song flex items-center text-[15px] font-semibold text-stone-800">
            <FileText size={16} className="mr-2 text-sky-400" />
            灵感与笔记
          </h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-[#A69B8F]">
          <div className="flex w-full max-w-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8CEC4] bg-[#F7F3EE]/50 p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100/50 bg-sky-50 shadow-sm">
              <FileText size={20} className="text-sky-400" strokeWidth={2} />
            </div>
            <p className="font-song mb-1 text-[15px] font-semibold text-[#5C4D42]">灵感与笔记</p>
            <p className="text-center text-[13px] leading-relaxed text-[#A69B8F]">
              记录判断、补充背景，让思路与转写自然汇合。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="border-b border-[#E3D9CE] px-4 py-4 sm:px-6 sm:py-5">
        <h3 className="font-song flex items-center text-[15px] font-semibold text-stone-800">
          <FileText size={16} className="mr-2 text-sky-400" />
          灵感与笔记
        </h3>
      </div>
      {/* 极简工具栏悬浮 */}
      {editor && (
        <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-[#E3D9CE] bg-[#FCFAF8]/90 px-6 py-4 backdrop-blur-md">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="标题"
          >
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="加粗"
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="斜体"
          >
            <Italic size={16} />
          </ToolbarButton>
          <div className="mx-2 h-4 w-px bg-[#D8CEC4]" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="无序列表"
          >
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="有序列表"
          >
            <ListOrdered size={16} />
          </ToolbarButton>
        </div>
      )}

      {/* 沉浸式编辑区 */}
      <div className="flex-1 overflow-y-auto px-8 py-8 bg-[#FCFAF8]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-xl p-2 transition-all ${
        active
          ? 'bg-sky-50 text-sky-600 shadow-sm border border-sky-100/50'
          : 'text-[#A69B8F] hover:bg-[#F7F3EE] hover:text-[#5C4D42] border border-transparent'
      }`}
    >
      {children}
    </button>
  );
}
