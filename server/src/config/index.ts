import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgres://user:password@127.0.0.1:5432/aegisgrid',
  ai: {
    provider: process.env.AI_PROVIDER || 'mock',
    apiKey: process.env.AI_API_KEY || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-for-development-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};
