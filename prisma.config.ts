/// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // where your schema file lives
  schema: 'prisma/schema.prisma',

  // where migrations will be stored
  migrations: {
    path: 'prisma/migrations',
  },

  // NEW in Prisma 7: put your DB URL here
  datasource: {
    url: env('DATABASE_URL'),
  },
});

