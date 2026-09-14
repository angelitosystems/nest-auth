export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Bright
  brightCyan: '\x1b[96m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
};

export const logger = {
  success: (msg: string) => {
    console.log(`${colors.green}✔${colors.reset} ${msg}`);
  },

  error: (msg: string) => {
    console.log(`${colors.red}✖${colors.reset} ${colors.bold}${msg}${colors.reset}`);
  },

  warning: (msg: string) => {
    console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
  },

  info: (msg: string) => {
    console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`);
  },

  title: (msg: string) => {
    console.log(`\n${colors.bold}${colors.brightCyan}◆ ${msg}${colors.reset}\n`);
  },

  step: (step: number, total: number, msg: string) => {
    console.log(`${colors.gray}[${step}/${total}]${colors.reset} ${colors.bold}${msg}${colors.reset}`);
  },

  command: (cmd: string) => {
    console.log(`  ${colors.dim}$${colors.reset} ${colors.brightCyan}${cmd}${colors.reset}`);
  },

  box: (title: string, lines: string[] = []) => {
    const width = 50;
    const border = '─'.repeat(width);
    console.log(`\n${colors.cyan}╭${border}╮${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${colors.bold}${title.padEnd(width - 1)}${colors.cyan}│${colors.reset}`);
    if (lines.length > 0) {
      console.log(`${colors.cyan}├${border}┤${colors.reset}`);
      for (const line of lines) {
        console.log(`${colors.cyan}│${colors.reset} ${line.padEnd(width - 1)}${colors.cyan}│${colors.reset}`);
      }
    }
    console.log(`${colors.cyan}╰${border}╯${colors.reset}\n`);
  },
};
