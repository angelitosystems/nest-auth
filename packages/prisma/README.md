# @angelitosystems/nest-auth-prisma

[![npm version](https://img.shields.io/npm/v/@angelitosystems/nest-auth-prisma.svg?color=06b6d4)](https://www.npmjs.com/package/@angelitosystems/nest-auth-prisma)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built by Angelito Systems](https://img.shields.io/badge/Built%20by-Angelito%20Systems-6366f1.svg)](https://angelitosystems.com)

Official Prisma ORM database persistence adapter for `@angelitosystems/nest-auth`.

---

## ⚡ Installation

```bash
npm install @angelitosystems/nest-auth @angelitosystems/nest-auth-prisma @prisma/client
```

---

## 🚀 Usage

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '@angelitosystems/nest-auth';
import { PrismaAuthAdapter } from '@angelitosystems/nest-auth-prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Module({
  imports: [
    AuthModule.forRoot({
      adapter: new PrismaAuthAdapter(prisma),
      jwt: {
        secret: process.env.AUTH_JWT_SECRET!,
      },
    }),
  ],
})
export class AppModule {}
```

---

## 📄 License

MIT © [Angelito Systems](https://angelitosystems.com)
