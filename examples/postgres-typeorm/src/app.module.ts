import { Module } from '@nestjs/common';
import { AuthModule } from '@angelitosystems/nest-auth';
import { AUTH_ENTITIES, TypeOrmAuthAdapter } from '@angelitosystems/nest-auth-typeorm';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/nest_auth_demo',
  entities: [...AUTH_ENTITIES],
  synchronize: true, // for demo development
});

const adapter = new TypeOrmAuthAdapter(dataSource);

@Module({
  imports: [
    AuthModule.forRoot({
      jwt: {
        secret: process.env.AUTH_JWT_SECRET || 'dev-secret-super-secure-at-least-32-chars',
      },
      cookies: {
        enabled: true,
        httpOnly: true,
        secure: false,
        name: 'access_token',
      },
      adapter,
      globalGuard: true,
    }),
  ],
})
export class AppModule {}
