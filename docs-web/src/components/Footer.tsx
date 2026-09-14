import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface FooterProps {
  onNavigate: (sectionId: string, itemId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { locale } = useI18n();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-12 text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <div className="w-6 h-6 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span>@angelitosystems/nest-auth</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            {locale === 'es'
              ? 'Ecosistema empresarial de autenticación, autorización, sesiones y persistencia para NestJS desarrollado por Angelito Systems.'
              : 'Enterprise authentication, authorization, session, and persistence ecosystem for NestJS engineered by Angelito Systems.'}
          </p>
          <div className="pt-2 text-[11px] text-slate-500">
            © {new Date().getFullYear()} Angelito Systems. {locale === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'} Released under the MIT License.
          </div>
        </div>

        {/* Col 2: Documentation */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
            {locale === 'es' ? 'Documentación' : 'Documentation'}
          </h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onNavigate('getting-started', 'quick-start')}
                className="hover:text-cyan-500 transition-colors"
              >
                {locale === 'es' ? 'Inicio Rápido (CLI)' : 'Quick Start (CLI)'}
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('authentication', 'jwt')}
                className="hover:text-cyan-500 transition-colors"
              >
                {locale === 'es' ? 'Estrategia JWT' : 'JWT Strategy'}
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('authorization', 'roles')}
                className="hover:text-cyan-500 transition-colors"
              >
                {locale === 'es' ? 'Roles & Permisos' : 'Roles & Permissions'}
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('database', 'database-overview')}
                className="hover:text-cyan-500 transition-colors"
              >
                {locale === 'es' ? 'Adaptadores de Base de Datos' : 'Database Adapters'}
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Community & Company */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
            Angelito Systems
          </h4>
          <ul className="space-y-2">
            <li>
              <a
                href="https://github.com/AngelitoSystems/nest-auth"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-500 transition-colors flex items-center gap-1"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/@angelitosystems/nest-auth"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-500 transition-colors flex items-center gap-1"
              >
                <span>NPM Package</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/AngelitoSystems/nest-auth/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-500 transition-colors flex items-center gap-1"
              >
                <span>{locale === 'es' ? 'Reportar un Problema' : 'Report an Issue'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
