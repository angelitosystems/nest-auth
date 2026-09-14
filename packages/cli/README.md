# nest-auth-kit

[![npm version](https://img.shields.io/npm/v/nest-auth-kit.svg?color=06b6d4)](https://www.npmjs.com/package/nest-auth-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built by Angelito Systems](https://img.shields.io/badge/Built%20by-Angelito%20Systems-6366f1.svg)](https://angelitosystems.com)

Official CLI toolkit for the `@angelitosystems/nest-auth` ecosystem by **Angelito Systems**.

---

## ⚡ Quick Start

Execute directly via `npx` inside any NestJS project:

```bash
npx nest-auth-kit init
```

---

## 🛠 Commands

### `init`
Interactive initialization wizard that detects existing ORMs, configures dependencies, seeds, migrations, and environment files:
```bash
npx nest-auth-kit init
```

### `doctor`
Comprehensive diagnostic tool checking Node.js, NestJS presence, TypeScript configurations, ORMs, and environment secrets:
```bash
npx nest-auth-kit doctor
```

### `migrate`
Execute, create, or revert migrations across Prisma, TypeORM, or Sequelize:
```bash
npx nest-auth-kit migrate
npx nest-auth-kit migrate create add-two-factor
```

### `seed`
Seed default roles (`admin`, `user`), baseline permissions (`users.*`, `roles.*`), and the initial administrator account:
```bash
npx nest-auth-kit seed
```

### `generate` (or `g`)
Generate authentication resources (guards, decorators, controllers, services):
```bash
npx nest-auth-kit generate guard custom-auth
npx nest-auth-kit generate decorator current-org
```

---

## 📄 License

MIT © [Angelito Systems](https://angelitosystems.com)
