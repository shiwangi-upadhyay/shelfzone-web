'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  // Extract language from className (e.g., "language-python" -> "python")
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  
  // Get the code string
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inline code (backticks)
  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[13px] font-mono text-slate-800 dark:text-slate-200"
        {...props}
      >
        {children}
      </code>
    );
  }

  // Code block
  return (
    <div className="relative group my-4">
      {/* Header with language badge and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-950 rounded-t-lg border-b border-slate-700">
        {language ? (
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            {language}
          </span>
        ) : (
          <span className="text-xs text-slate-500">Code</span>
        )}
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all",
            "hover:bg-slate-700 active:bg-slate-600",
            copied 
              ? "text-green-400" 
              : "text-slate-400 hover:text-slate-200"
          )}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                Copy
              </span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      <div className="rounded-b-lg overflow-hidden">
        <SyntaxHighlighter
          language={language || 'text'}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '13px',
            lineHeight: '1.6',
            background: '#0f172a', // slate-900
          }}
          showLineNumbers={true}
          wrapLines={true}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#475569',
            userSelect: 'none',
          }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks and inline code
          code: CodeBlock,
          
          // Headings
          h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-bold mt-5 mb-3 text-foreground" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-base font-semibold mt-3 mb-2 text-foreground" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-sm font-semibold mt-3 mb-2 text-foreground" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-xs font-semibold mt-3 mb-2 text-foreground uppercase tracking-wide" {...props}>
              {children}
            </h6>
          ),
          
          // Paragraphs
          p: ({ children, ...props }) => (
            <p className="mb-3 leading-relaxed text-foreground" {...props}>
              {children}
            </p>
          ),
          
          // Lists
          ul: ({ children, ...props }) => (
            <ul className="mb-3 ml-6 list-disc space-y-1 text-foreground" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="mb-3 ml-6 list-decimal space-y-1 text-foreground" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-relaxed" {...props}>
              {children}
            </li>
          ),
          
          // Blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-indigo-500 pl-4 py-1 my-3 italic text-slate-600 dark:text-slate-400"
              {...props}
            >
              {children}
            </blockquote>
          ),
          
          // Links
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          
          // Horizontal rule
          hr: ({ ...props }) => (
            <hr className="my-6 border-t border-slate-300 dark:border-slate-700" {...props} />
          ),
          
          // Tables
          table: ({ children, ...props }) => (
            <div className="my-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-300 dark:divide-slate-700 border border-slate-300 dark:border-slate-700" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-slate-100 dark:bg-slate-800" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr {...props}>{children}</tr>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-4 py-2 text-sm text-foreground" {...props}>
              {children}
            </td>
          ),
          
          // Strong (bold)
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-foreground" {...props}>
              {children}
            </strong>
          ),
          
          // Emphasis (italic)
          em: ({ children, ...props }) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),
          
          // Strikethrough
          del: ({ children, ...props }) => (
            <del className="line-through text-slate-500 dark:text-slate-500" {...props}>
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
