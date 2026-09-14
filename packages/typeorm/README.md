# @angelitosystems/nest-auth-typeorm

[![npm version](https://img.shields.io/npm/v/@angelitosystems/nest-auth-typeorm.svg?color=06b6d4)](https://www.npmjs.com/package/@angelitosystems/nest-auth-typeorm)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built by Angelito Systems](https://img.shields.io/badge/Built%20by-Angelito%20Systems-6366f1.svg)](https://angelitosystems.com)

Official TypeORM database persistence adapter for `@angelitosystems/nest-auth` (PostgreSQL & MySQL).

---

## ⚡ Installation

```bash
npm install @angelitosystems/nest-auth @angelitosystems/nest-auth-typeorm typeorm
```

---

## 🚀 Usage

```typescript
import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthModule } from '@angelitosystems/nest-auth';
import { TypeOrmAuthAdapter, AUTH_ENTITIES } from '@angelitosystems/nest-auth-typeorm';

// In your TypeORM configuration, register AUTH_ENTITIES
// Then inject or instantiate DataSource:
const adapter = new TypeOrmAuthAdapter(dataSource);

@Module({
  imports: [
    AuthModule.forRoot({
      adapter,
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
