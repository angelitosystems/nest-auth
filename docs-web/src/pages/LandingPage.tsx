import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  Lock,
  Database,
  Users,
  Activity,
  Key,
  Copy,
  Check,
  Github,
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { TerminalBlock } from '../components/TerminalBlock';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (sectionId: string, itemId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onNavigate,
}) => {
  const { locale, t } = useI18n();
  const [cmdCopied, setCmdCopied] = useState(false);

  const initCommand = 'npx nest-auth-kit init';

  const copyInitCommand = () => {
    navigator.clipboard.writeText(initCommand);
    setCmdCopied(true);
    setTimeout(() => setCmdCopied(false), 2000);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>{t.landing.heroBadge}</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            {locale === 'es' ? (
              <>
                Autenticación <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500">Profesional</span> para NestJS
              </>
            ) : (
              <>
                Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500">Authentication</span> for NestJS
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.landing.heroSubtitle}
          </p>

          {/* Interactive Command Pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 shadow-xl text-slate-200 font-mono text-sm group">
              <span className="text-cyan-400 select-none">$</span>
              <span>{initCommand}</span>
              <button
                onClick={copyInitCommand}
                className="ml-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Copy command"
              >
                {cmdCopied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all cursor-pointer"
            >
              <span>{t.common.getStarted}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://github.com/AngelitoSystems/nest-auth"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>{locale === 'es' ? 'Ver en GitHub' : 'View on GitHub'}</span>
            </a>
          </div>

          {/* Terminal Block Demonstration */}
          <div className="max-w-3xl mx-auto pt-8 text-left">
            <TerminalBlock
              title="Terminal · nest-auth-kit init"
              command="npx nest-auth-kit init"
              lines={[
                { type: 'info', text: '🔍 Analyzing project environment...' },
                { type: 'success', text: '✔ NestJS detected (^10.4.15)' },
                { type: 'success', text: '✔ TypeScript configured (tsconfig.json)' },
                { type: 'input', text: '? Select your database: PostgreSQL' },
                { type: 'input', text: '? Select ORM adapter: Prisma' },
                { type: 'input', text: '? Authentication delivery: JWT + Cookies' },
                { type: 'success', text: '✔ Authentication scaffolding created in src/auth/' },
                { type: 'info', text: '✨ Ready to build enterprise security!' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Database & ORM Matrix Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.landing.matrixTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {t.landing.matrixSubtitle}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl bg-white dark:bg-slate-900/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Database</th>
                <th className="py-3.5 px-6">ORM / ODM</th>
                <th className="py-3.5 px-6">Adapter Package</th>
                <th className="py-3.5 px-6">Supported Features</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-500" />
                  PostgreSQL
                </td>
                <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">Prisma</td>
                <td className="py-4 px-6 font-mono text-xs text-cyan-600 dark:text-cyan-400">@angelitosystems/nest-auth-prisma</td>
                <td className="py-4 px-6 text-xs text-emerald-600 dark:text-emerald-400 font-medium">RBAC · Sessions · 2FA · Audit · Migrations</td>
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-500" />
                  PostgreSQL
                </td>
                <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">TypeORM</td>
                <td className="py-4 px-6 font-mono text-xs text-cyan-600 dark:text-cyan-400">@angelitosystems/nest-auth-typeorm</td>
                <td className="py-4 px-6 text-xs text-emerald-600 dark:text-emerald-400 font-medium">RBAC · Sessions · 2FA · Audit · Migrations</td>
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-500" />
                  MySQL
                </td>
                <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">TypeORM</td>
                <td className="py-4 px-6 font-mono text-xs text-cyan-600 dark:text-cyan-400">@angelitosystems/nest-auth-typeorm</td>
                <td className="py-4 px-6 text-xs text-emerald-600 dark:text-emerald-400 font-medium">RBAC · Sessions · 2FA · Audit · Migrations</td>
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-500" />
                  MySQL
                </td>
                <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">Sequelize</td>
                <td className="py-4 px-6 font-mono text-xs text-cyan-600 dark:text-cyan-400">@angelitosystems/nest-auth-sequelize</td>
                <td className="py-4 px-6 text-xs text-emerald-600 dark:text-emerald-400 font-medium">RBAC · Sessions · 2FA · Audit · Migrations</td>
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-500" />
                  MongoDB
                </td>
                <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">Mongoose</td>
                <td className="py-4 px-6 font-mono text-xs text-cyan-600 dark:text-cyan-400">@angelitosystems/nest-auth-mongoose</td>
                <td className="py-4 px-6 text-xs text-emerald-600 dark:text-emerald-400 font-medium">RBAC · Sessions · 2FA · Audit · Auto-indexes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.landing.whyTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {t.landing.whySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.features.map((feat) => (
            <div
              key={feat.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-md hover:border-cyan-500/50 hover:shadow-cyan-500/10 transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                {feat.id === 'dual-auth' && <Key className="w-5 h-5" />}
                {feat.id === 'rbac-permissions' && <Users className="w-5 h-5" />}
                {feat.id === 'sessions' && <Activity className="w-5 h-5" />}
                {feat.id === 'two-factor' && <Lock className="w-5 h-5" />}
                {feat.id === 'audit-trail' && <Shield className="w-5 h-5" />}
                {feat.id === 'adapters' && <Database className="w-5 h-5" />}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-8 sm:p-12 text-center text-white shadow-2xl space-y-6 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t.landing.ctaTitle}
            </h2>
            <p className="text-cyan-100 text-sm sm:text-base leading-relaxed">
              {t.landing.ctaSubtitle}
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 rounded-xl bg-white text-slate-950 font-bold shadow-lg hover:bg-cyan-50 transition-colors cursor-pointer"
              >
                {t.common.getStarted}
              </button>
              <button
                onClick={() => onNavigate('getting-started', 'cli')}
                className="px-6 py-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 border border-white/20 text-white font-semibold transition-colors cursor-pointer"
              >
                {locale === 'es' ? 'Ver Documentación CLI' : 'Explore CLI Reference'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
