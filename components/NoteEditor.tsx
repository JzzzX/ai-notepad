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
      <div className="flex h-full flex-col items-center justify-center text-zinc-400">
        <FileText size={48} strokeWidth={1} className="mb-4 opacity-50" />
        <p className="text-sm font-medium">笔记编辑器</p>
        <p className="mt-1 text-xs">开始录音后，在这里记录你的要点</p>
        <p className="mt-3 max-w-[200px] text-center text-xs leading-relaxed text-zinc-300">
          AI 会将你的手写要点与转写内容融合，生成结构化会议纪要
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2">
        <h3 className="text-sm font-semibold text-zinc-700">我的笔记</h3>
        <span className="text-xs text-zinc-400">边听边记要点</span>
      </div>

      {/* 工具栏 */}
      {editor && (
        <div className="flex items-center gap-0.5 border-b border-zinc-100 px-3 py-1.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="标题"
          >
            <Heading2 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="加粗"
          >
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="斜体"
          >
            <Italic size={14} />
          </ToolbarButton>
          <div className="mx-1 h-4 w-px bg-zinc-200" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="无序列表"
          >
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="有序列表"
          >
            <ListOrdered size={14} />
          </ToolbarButton>
        </div>
      )}

      {/* 编辑区 */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      <div className="border-t border-zinc-100 px-4 py-2">
        <p className="text-xs text-zinc-400">
          提示：记录关键要点，AI 会融合转写内容生成完整纪要
        </p>
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
      className={`rounded p-1.5 transition-colors ${
        active
          ? 'bg-zinc-200 text-zinc-800'
          : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'
      }`}
    >
      {children}
    </button>
  );
}
