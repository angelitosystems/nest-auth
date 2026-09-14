import { colors } from './logger';

export class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private current = 0;
  private timer: NodeJS.Timeout | null = null;
  private message: string;

  constructor(message: string) {
    this.message = message;
  }

  start(): this {
    process.stdout.write('\x1b[?25l'); // Hide cursor
    this.timer = setInterval(() => {
      process.stdout.write(`\r${colors.cyan}${this.frames[this.current]}${colors.reset} ${this.message}`);
      this.current = (this.current + 1) % this.frames.length;
    }, 80);
    return this;
  }

  update(newMessage: string): this {
    this.message = newMessage;
    return this;
  }

  succeed(text?: string): void {
    this.stop();
    const msg = text || this.message;
    console.log(`\r${colors.green}✔${colors.reset} ${msg}`);
  }

  fail(text?: string): void {
    this.stop();
    const msg = text || this.message;
    console.log(`\r${colors.red}✖${colors.reset} ${msg}`);
  }

  warn(text?: string): void {
    this.stop();
    const msg = text || this.message;
    console.log(`\r${colors.yellow}⚠${colors.reset} ${msg}`);
  }

  private stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    process.stdout.write('\r\x1b[K'); // Clear line
    process.stdout.write('\x1b[?25h'); // Restore cursor
  }
}

export function createSpinner(message: string): Spinner {
  return new Spinner(message);
}
