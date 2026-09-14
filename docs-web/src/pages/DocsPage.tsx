import { Sidebar } from '../components/Sidebar';
import { navigationData } from '../data/navigation';
import { docsContentMap } from '../data/docsContent';
import { useI18n } from '../hooks/useI18n';
import { ArrowLeft, ArrowRight, ChevronRight, Shield } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import { TerminalBlock } from '../components/TerminalBlock';

interface DocsPageProps {
  sectionId: string;
  itemId: string;
  onSelect: (sectionId: string, itemId: string) => void;
  onGoHome: () => void;
}

export function DocsPage({ sectionId, itemId, onSelect, onGoHome }: DocsPageProps) {
  const { locale, t } = useI18n();

  // Find category and item titles for Breadcrumbs
  const currentCategory = navigationData.find((s) => s.id === sectionId) || navigationData[0];
  const currentItem = currentCategory.items.find((i) => i.id === itemId) || currentCategory.items[0];

  const categoryTitle = locale === 'es' ? currentCategory.titleEs : currentCategory.titleEn;
  const itemTitle = locale === 'es' ? currentItem.titleEs : currentItem.titleEn;

  // Linear navigation
  const allItems: Array<{ sectionId: string; itemId: string; title: string }> = [];
  navigationData.forEach((s) => {
    s.items.forEach((i) => {
      allItems.push({
        sectionId: s.id,
        itemId: i.id,
        title: locale === 'es' ? i.titleEs : i.titleEn,
      });
    });
  });

  const currentIndex = allItems.findIndex((x) => x.sectionId === sectionId && x.itemId === itemId);
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  // Retrieve content from catalog
  const content = docsContentMap[itemId] || docsContentMap['introduction'];

  const title = locale === 'es' ? content.titleEs : content.titleEn;
  const lead = locale === 'es' ? content.leadEs : content.leadEn;
  const body = locale === 'es' ? content.bodyEs : content.bodyEn;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-10">
      {/* Sidebar */}
      <Sidebar
        activeSectionId={sectionId}
        activeItemId={itemId}
        onSelect={(sec, itm) => {
          onSelect(sec, itm);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pb-16 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <button onClick={onGoHome} className="hover:text-cyan-500 transition-colors">
            {locale === 'es' ? 'Inicio' : 'Home'}
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="capitalize">{categoryTitle}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold">{itemTitle}</span>
        </div>

        {/* Section Header */}
        <div className="space-y-3 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Angelito Systems</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            {lead}
          </p>
        </div>

        {/* Markdown-style Content Body */}
        <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
          {body.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={pIdx} className="text-lg font-bold text-slate-900 dark:text-white pt-4">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('- ')) {
              const bullets = paragraph.split('\n');
              return (
                <ul key={pIdx} className="list-disc pl-5 space-y-1.5">
                  {bullets.map((b, bIdx) => (
                    <li key={bIdx}>{b.replace(/^- /, '')}</li>
                  ))}
                </ul>
              );
            }
            return <p key={pIdx}>{paragraph}</p>;
          })}
        </div>

        {/* Terminal Block if provided */}
        {content.terminalSnippet && (
          <div className="pt-2">
            <TerminalBlock
              title={content.terminalSnippet.title}
              command={content.terminalSnippet.command}
              lines={content.terminalSnippet.lines}
            />
          </div>
        )}

        {/* Code Snippet if provided */}
        {content.codeSnippet && (
          <div className="pt-2">
            <CodeBlock
              language={content.codeSnippet.language}
              filename={content.codeSnippet.filename}
              code={content.codeSnippet.code}
            />
          </div>
        )}

        {/* Linear Next / Prev Navigation */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevItem ? (
            <button
              onClick={() => onSelect(prevItem.sectionId, prevItem.itemId)}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-left transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {t.common.previous}
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                  {prevItem.title}
                </p>
              </div>
            </button>
          ) : <div />}

          {nextItem ? (
            <button
              onClick={() => onSelect(nextItem.sectionId, nextItem.itemId)}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-right transition-colors cursor-pointer group"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {t.common.next}
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                  {nextItem.title}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
            </button>
          ) : <div />}
        </div>
      </main>
    </div>
  );
}
