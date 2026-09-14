import { Module } from '@nestjs/common';
import { AuthModule } from '@angelitosystems/nest-auth';
import { MongooseAuthAdapter } from '@angelitosystems/nest-auth-mongoose';
import mongoose from 'mongoose';

// Connect to MongoDB
const conn = mongoose.createConnection(process.env.MONGODB_URI || 'mongodb://localhost:27017/nest_auth_demo');
const adapter = new MongooseAuthAdapter(conn);

@Module({
  imports: [
    AuthModule.forRoot({
      jwt: {
        secret: process.env.AUTH_JWT_SECRET || 'dev-secret-super-secure-at-least-32-chars',
      },
      adapter,
      globalGuard: true,
    }),
  ],
})
export class AppModule {}
