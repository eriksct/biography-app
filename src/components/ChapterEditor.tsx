import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useEffect, useCallback } from 'react';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading2 } from 'lucide-react';

interface ChapterEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  placeholder?: string;
}

export function ChapterEditor({ content, onUpdate, placeholder }: ChapterEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      Underline,
    ],
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-stone dark:prose-invert max-w-none font-serif text-content leading-relaxed focus:outline-none min-h-[calc(100vh-300px)]',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  // Sync content from outside (e.g. passage insertion)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '<p></p>', { emitUpdate: false });
    }
  }, [content, editor]);

  const ToolbarButton = useCallback(({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      }`}
    >
      {children}
    </button>
  ), []);

  if (!editor) return null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-1 py-1.5 border-b border-border mb-6">
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Gras (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italique (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Souligné (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Barré (Ctrl+Shift+S)"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Titre de paragraphe"
        >
          <span className="font-sans font-medium text-sm">Titre</span>
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}

/** Extract H2 headings from HTML content */
export function extractHeadings(html: string): { id: string; text: string }[] {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const h2s = doc.querySelectorAll('h2');
  return Array.from(h2s).map((h2, i) => ({
    id: `heading-${i}`,
    text: h2.textContent || '',
  }));
}
