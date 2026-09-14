import { Module } from '@nestjs/common';
import { AuthModule } from '@angelitosystems/nest-auth';
import { AUTH_MODELS, SequelizeAuthAdapter } from '@angelitosystems/nest-auth-sequelize';
import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'nest_auth_demo',
  username: 'root',
  password: 'password',
  models: [...AUTH_MODELS],
});

const adapter = new SequelizeAuthAdapter(sequelize);

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
