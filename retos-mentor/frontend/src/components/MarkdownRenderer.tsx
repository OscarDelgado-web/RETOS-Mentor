import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar código:', err);
    }
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-zinc-800 bg-[#0d0d11] shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-[11px] text-zinc-400 font-mono">
        <span className="uppercase font-semibold tracking-wider text-emerald-400/90">
          {language || 'código'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Copiar código al portapapeles"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copiado</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono text-zinc-200 leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content text-xs sm:text-sm leading-relaxed text-zinc-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-white mt-4 mb-2 first:mt-0 pb-1 border-b border-zinc-800">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-white mt-3.5 mb-2 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold text-emerald-400 mt-3 mb-1.5 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 mt-2 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-zinc-200">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-2.5 space-y-1 marker:text-emerald-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-2.5 space-y-1 marker:text-emerald-500 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-zinc-200 leading-relaxed">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-300">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 pl-3.5 pr-3 py-2 rounded-r-2xl border-l-4 border-emerald-500 bg-emerald-500/10 text-zinc-300 italic">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-4 border-zinc-800/80" />
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-2xl border border-zinc-800 shadow-md">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-900/90 text-zinc-200 border-b border-zinc-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-800/70 bg-[#0d0d11]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-zinc-800/40 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 font-semibold text-zinc-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-zinc-300 font-mono text-[11px] sm:text-xs">
              {children}
            </td>
          ),
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const rawCode = String(children).replace(/\n$/, '');
            const isMultiline = rawCode.includes('\n');

            if (match || isMultiline) {
              return (
                <CodeBlock
                  language={match ? match[1] : ''}
                  code={rawCode}
                />
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded-md bg-zinc-800/90 border border-zinc-700/60 text-emerald-300 font-mono text-[11px] sm:text-xs"
                {...props}
              >
                {children}
              </code>
            );
          },
          a: ({ href, children }) => {
            let safeHref = '#';
            if (href) {
              try {
                const parsed = new URL(href);
                if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                  safeHref = parsed.href;
                }
              } catch {
                safeHref = '#';
              }
            }

            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2 transition-colors"
              >
                <span>{children}</span>
                <ExternalLink size={10} className="inline ml-0.5 shrink-0" />
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

