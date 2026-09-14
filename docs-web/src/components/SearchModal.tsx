import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, BookOpen } from 'lucide-react';
import { searchIndex, SearchItem } from '../data/searchIndex';
import { useI18n } from '../hooks/useI18n';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sectionId: string, itemId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { locale } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = searchIndex.filter((item) => {
      const title = locale === 'es' ? item.titleEs : item.titleEn;
      const snippet = locale === 'es' ? item.snippetEs : item.snippetEn;
      const matchTitle = title.toLowerCase().includes(q);
      const matchSnippet = snippet.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchSnippet || matchKeywords;
    });

    setResults(filtered);
  }, [query, locale]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder={locale === 'es' ? 'Buscar en la documentación (JWT, Roles, Prisma, CLI, etc.)...' : 'Search documentation (JWT, Roles, Prisma, CLI, etc.)...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs text-slate-400 select-none">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-800/60">
          {query.trim() && results.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">
                {locale === 'es' ? 'No se encontraron resultados para ' : 'No results found for '}
                <span className="text-white font-semibold">"{query}"</span>
              </p>
            </div>
          )}

          {!query.trim() && (
            <div className="py-8 text-center text-slate-500 text-sm">
              {locale === 'es' ? 'Escribe un término de búsqueda (ej. "jwt", "roles", "prisma").' : 'Type a search term (e.g. "jwt", "roles", "prisma").'}
            </div>
          )}

          {results.map((item) => (
            <button
              key={`${item.sectionId}-${item.id}`}
              onClick={() => {
                onSelect(item.sectionId, item.id);
                onClose();
              }}
              className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-cyan-950/40 hover:border-cyan-800/60 border border-transparent text-left transition-colors group"
            >
              <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {locale === 'es' ? item.titleEs : item.titleEn}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">
                    {item.sectionId.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {locale === 'es' ? item.snippetEs : item.snippetEn}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
