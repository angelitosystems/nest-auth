import { useState } from 'react';
import { Check, Copy, Terminal as TerminalIcon } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export function Terminal() {
  const [pm, setPm] = useState<PackageManager>('npm');
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const commands: Record<PackageManager, { install: string; cli: string }> = {
    npm: {
      install: 'npm install @angelitosystems/nest-auth',
      cli: 'npx nest-auth-kit init',
    },
    pnpm: {
      install: 'pnpm add @angelitosystems/nest-auth',
      cli: 'pnpm dlx nest-auth-kit init',
    },
    yarn: {
      install: 'yarn add @angelitosystems/nest-auth',
      cli: 'yarn dlx nest-auth-kit init',
    },
    bun: {
      install: 'bun add @angelitosystems/nest-auth',
      cli: 'bunx nest-auth-kit init',
    },
  };

  const currentCommand = commands[pm].cli;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden my-6">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            {t.landing.terminal.title}
          </span>
        </div>

        {/* Package manager tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {(['npm', 'pnpm', 'yarn', 'bun'] as PackageManager[]).map((manager) => (
            <button
              key={manager}
              onClick={() => setPm(manager)}
              className={`px-2.5 py-1 rounded-md font-mono transition-colors ${
                pm === manager
                  ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {manager}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal content */}
      <div className="p-6 font-mono text-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="text-slate-500 select-none">$</span>
            <span>{currentCommand}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{t.common.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t.common.copy}</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-900">
          <div className="text-emerald-400">
            {t.landing.terminal.detectedNest}
          </div>
          <div className="text-emerald-400">
            {t.landing.terminal.detectedTs}
          </div>
          <div className="text-slate-500">
            {t.landing.terminal.configuredSuccess}
          </div>
          <div className="text-cyan-400">
            {t.landing.terminal.readyToStart}
          </div>
        </div>
      </div>
    </div>
  );
}
