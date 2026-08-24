'use client';

import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
  Strikethrough,
  Underline
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write a detailed project description...',
  minHeight = '140px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Synchronize external value changes only if editor isn't actively being typed in
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html === '<br>' || html === '<p></p>' ? '' : html);
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  const addLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      exec('createLink', url.startsWith('http') ? url : `https://${url}`);
    }
  };

  const formatBlock = (tag: string) => {
    exec('formatBlock', `<${tag}>`);
  };

  return (
    <div className="rounded-md border border-input bg-background/50 overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
      {/* WYSIWYG Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1.5 text-muted-foreground">
        <button
          type="button"
          onClick={() => exec('bold')}
          title="Bold (Ctrl+B)"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => exec('italic')}
          title="Italic (Ctrl+I)"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => exec('underline')}
          title="Underline (Ctrl+U)"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => exec('strikeThrough')}
          title="Strikethrough"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <button
          type="button"
          onClick={() => formatBlock('h2')}
          title="Heading 2"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => formatBlock('h3')}
          title="Heading 3"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <button
          type="button"
          onClick={() => exec('insertUnorderedList')}
          title="Bullet List"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => exec('insertOrderedList')}
          title="Numbered List"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => formatBlock('blockquote')}
          title="Quote"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => formatBlock('pre')}
          title="Code Block"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <button
          type="button"
          onClick={addLink}
          title="Insert Link"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => exec('removeFormat')}
          title="Clear Formatting"
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
        >
          <RemoveFormatting className="h-4 w-4" />
        </button>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        style={{ minHeight }}
        data-placeholder={placeholder}
        className="p-3 text-sm outline-none text-foreground prose dark:prose-invert max-w-none focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
      />
    </div>
  );
}
