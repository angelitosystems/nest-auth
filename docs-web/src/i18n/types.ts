export type Locale = 'en' | 'es';

export interface Translations {
  common: {
    getStarted: string;
    viewOnNpm: string;
    githubRepo: string;
    documentation: string;
    guides: string;
    apiReference: string;
    searchPlaceholder: string;
    searchShortcut: string;
    copy: string;
    copied: string;
    builtForNestjs: string;
    builtBy: string;
    version: string;
    license: string;
    light: string;
    dark: string;
    system: string;
    tableOfContents: string;
    next: string;
    previous: string;
  };
  landing: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    quickInstall: string;
    whyTitle: string;
    whySubtitle: string;
    stats: {
      nativeNestjs: string;
      nativeNestjsDesc: string;
      multiOrm: string;
      multiOrmDesc: string;
      securityFirst: string;
      securityFirstDesc: string;
      zeroVulnerabilities: string;
      zeroVulnerabilitiesDesc: string;
      typedArchitecture: string;
      typedArchitectureDesc: string;
    };
    terminal: {
      title: string;
      detectedNest: string;
      detectedTs: string;
      configuredSuccess: string;
      readyToStart: string;
    };
    matrixTitle: string;
    matrixSubtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
  };
  features: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}
