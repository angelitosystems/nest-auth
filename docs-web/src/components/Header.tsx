import { useState } from 'react';
import {
  Shield,
  Search,
  Globe,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { Theme, useTheme } from '../hooks/useTheme';

interface HeaderProps {
  onOpenSearch: () => void;
  onNavigate: (sectionId: string, itemId: string) => void;
  onGoHome: () => void;
}

export function Header({ onOpenSearch, onNavigate, onGoHome }: HeaderProps) {
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const handleNavClick = (sectionId: string, itemId: string) => {
    onNavigate(sectionId, itemId);
    setMobileMenuOpen(false);
  };

  const cycleTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    setThemeDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-600/30 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                @angelitosystems/<span className="text-cyan-600 dark:text-cyan-400">nest-auth</span>
                <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded-full font-medium hidden sm:inline-block">
                  v1.0.0
                </span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Angelito Systems
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search trigger & Quick Links */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => handleNavClick('getting-started', 'introduction')}
              className="px-3 py-1.5 rounded-lg hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
            >
              {t.common.documentation}
            </button>
            <button
              onClick={() => handleNavClick('authentication', 'jwt')}
              className="px-3 py-1.5 rounded-lg hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
            >
              {locale === 'es' ? 'Autenticación' : 'Authentication'}
            </button>
            <button
              onClick={() => handleNavClick('authorization', 'roles')}
              className="px-3 py-1.5 rounded-lg hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
            >
              {locale === 'es' ? 'Autorización' : 'Authorization'}
            </button>
            <button
              onClick={() => handleNavClick('database', 'database-overview')}
              className="px-3 py-1.5 rounded-lg hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
            >
              {locale === 'es' ? 'Adaptadores' : 'Adapters'}
            </button>
          </nav>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-cyan-500/50 transition-all cursor-pointer w-48 justify-between shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-cyan-500" />
              <span>{t.common.searchPlaceholder}</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500">
              {t.common.searchShortcut}
            </kbd>
          </button>
        </div>

        {/* Right side icons & dropdowns */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Switcher (EN | ES) */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-500" />
              <span className="uppercase">{locale}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-fade-in text-xs font-medium">
                <button
                  onClick={() => {
                    setLocale('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    locale === 'en' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>English</span>
                  {locale === 'en' && <span className="text-[10px]">●</span>}
                </button>
                <button
                  onClick={() => {
                    setLocale('es');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    locale === 'es' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>Español</span>
                  {locale === 'es' && <span className="text-[10px]">●</span>}
                </button>
              </div>
            )}
          </div>

          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
              title="Theme Toggle"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-cyan-400" />
              ) : (
                <Monitor className="w-4 h-4" />
              )}
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs font-medium">
                <button
                  onClick={() => cycleTheme('light')}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.common.light}</span>
                </button>
                <button
                  onClick={() => cycleTheme('dark')}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Moon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.common.dark}</span>
                </button>
                <button
                  onClick={() => cycleTheme('system')}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>{t.common.system}</span>
                </button>
              </div>
            )}
          </div>

          {/* External Links */}
          <a
            href="https://github.com/AngelitoSystems/nest-auth"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
            title="GitHub Repository"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-2">
          <button
            onClick={() => handleNavClick('getting-started', 'introduction')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {t.common.documentation}
          </button>
          <button
            onClick={() => handleNavClick('authentication', 'jwt')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {locale === 'es' ? 'Autenticación' : 'Authentication'}
          </button>
          <button
            onClick={() => handleNavClick('authorization', 'roles')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {locale === 'es' ? 'Autorización' : 'Authorization'}
          </button>
          <button
            onClick={() => handleNavClick('database', 'database-overview')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {locale === 'es' ? 'Adaptadores' : 'Adapters'}
          </button>
        </div>
      )}
    </header>
  );
}
