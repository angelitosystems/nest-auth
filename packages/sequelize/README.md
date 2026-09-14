# @angelitosystems/nest-auth-sequelize

[![npm version](https://img.shields.io/npm/v/@angelitosystems/nest-auth-sequelize.svg?color=06b6d4)](https://www.npmjs.com/package/@angelitosystems/nest-auth-sequelize)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built by Angelito Systems](https://img.shields.io/badge/Built%20by-Angelito%20Systems-6366f1.svg)](https://angelitosystems.com)

Official Sequelize database persistence adapter for `@angelitosystems/nest-auth` (MySQL & PostgreSQL).

---

## ⚡ Installation

```bash
npm install @angelitosystems/nest-auth @angelitosystems/nest-auth-sequelize sequelize sequelize-typescript
```

---

## 🚀 Usage

```typescript
import { Module } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { AuthModule } from '@angelitosystems/nest-auth';
import { SequelizeAuthAdapter, AUTH_MODELS } from '@angelitosystems/nest-auth-sequelize';

// Register AUTH_MODELS in your Sequelize instance:
const sequelize = new Sequelize({
  // options...
  models: [...AUTH_MODELS],
});

const adapter = new SequelizeAuthAdapter(sequelize);

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
