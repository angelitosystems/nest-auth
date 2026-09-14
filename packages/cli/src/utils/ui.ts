import { colors, logger } from './logger';

export { colors, logger };

export const ui = {
  ...logger,
  warn: (msg: string) => logger.warning(msg),
  bold: (msg: string) => `${colors.bold}${msg}${colors.reset}`,
  dim: (msg: string) => `${colors.dim}${msg}${colors.reset}`,
  cyan: (msg: string) => `${colors.cyan}${msg}${colors.reset}`,
  green: (msg: string) => `${colors.green}${msg}${colors.reset}`,
  yellow: (msg: string) => `${colors.yellow}${msg}${colors.reset}`,
  red: (msg: string) => `${colors.red}${msg}${colors.reset}`,
  banner: () => {
    console.log(`
${colors.cyan}${colors.bold}    _                    _ _ _          
   / \\   _ __   __ _  ___| (_) |_ ___   
  / _ \\ | '_ \\ / _\` |/ _ \\ | | __/ _ \\  
 / ___ \\| | | | (_| |  __/ | | || (_) | 
/_/   \\_\\_| |_|\\__, |\\___|_|_|\\__\\___/  
               |___/                    ${colors.reset}

       ${colors.bold}Angelito Systems${colors.reset}
       ${colors.dim}NestJS Authentication Toolkit · v1.0.0${colors.reset}
`);
  },

  terminalWindow: (title: string, content: string[]) => {
    const width = 60;
    console.log(`${colors.gray}┌─ ${colors.white}${colors.bold}${title}${colors.gray} ${'─'.repeat(width - title.length - 4)}┐${colors.reset}`);
    console.log(`${colors.gray}│${colors.reset}${' '.repeat(width)}${colors.gray}│${colors.reset}`);
    for (const line of content) {
      const padded = line.padEnd(width);
      console.log(`${colors.gray}│${colors.reset} ${padded.slice(0, width - 2)} ${colors.gray}│${colors.reset}`);
    }
    console.log(`${colors.gray}│${colors.reset}${' '.repeat(width)}${colors.gray}│${colors.reset}`);
    console.log(`${colors.gray}└${'─'.repeat(width)}┘${colors.reset}`);
  },
};
