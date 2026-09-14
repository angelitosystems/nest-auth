# @angelitosystems/nest-auth-mongoose

[![npm version](https://img.shields.io/npm/v/@angelitosystems/nest-auth-mongoose.svg?color=06b6d4)](https://www.npmjs.com/package/@angelitosystems/nest-auth-mongoose)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built by Angelito Systems](https://img.shields.io/badge/Built%20by-Angelito%20Systems-6366f1.svg)](https://angelitosystems.com)

Official Mongoose database persistence adapter for `@angelitosystems/nest-auth` (MongoDB).

---

## ⚡ Installation

```bash
npm install @angelitosystems/nest-auth @angelitosystems/nest-auth-mongoose mongoose
```

---

## 🚀 Usage

```typescript
import { Module } from '@nestjs/common';
import mongoose from 'mongoose';
import { AuthModule } from '@angelitosystems/nest-auth';
import { MongooseAuthAdapter } from '@angelitosystems/nest-auth-mongoose';

// Connect mongoose:
await mongoose.connect(process.env.MONGODB_URI!);

const adapter = new MongooseAuthAdapter(mongoose.connection);

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
