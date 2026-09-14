import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface TerminalBlockProps {
  title?: string;
  command?: string;
  lines?: { type: 'input' | 'output' | 'success' | 'warn' | 'info' | 'dim'; text: string }[];
  className?: string;
}

export const TerminalBlock: React.FC<TerminalBlockProps> = ({
  title = 'Terminal',
  command,
  lines,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const textToCopy = command || lines?.map((l) => l.text).join('\n') || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950/95 shadow-2xl font-mono text-sm ${className}`}>
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs select-none">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 hover:opacity-100 transition-opacity" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:opacity-100 transition-opacity" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 hover:opacity-100 transition-opacity" />
          <span className="ml-2 text-slate-400 font-medium flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            {title}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
          title="Copy command"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Content */}
      <div className="p-4 space-y-1.5 leading-relaxed text-slate-200 overflow-x-auto">
        {command && (
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <span className="text-slate-500">$</span>
            <span>{command}</span>
          </div>
        )}

        {lines?.map((line, idx) => {
          let textColor = 'text-slate-300';
          if (line.type === 'input') textColor = 'text-cyan-300 font-semibold';
          if (line.type === 'success') textColor = 'text-emerald-400';
          if (line.type === 'warn') textColor = 'text-amber-400';
          if (line.type === 'info') textColor = 'text-sky-400';
          if (line.type === 'dim') textColor = 'text-slate-500';

          return (
            <div key={idx} className={`${textColor} whitespace-pre`}>
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
