export interface AppConfig {
  host: string;
  port: number;
  databaseUrl: string;
  nodeEnv: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }
  return {
    host: env.HOST ?? '127.0.0.1',
    port: Number(env.PORT ?? 3001),
    databaseUrl,
    nodeEnv: env.NODE_ENV ?? 'development'
  };
}
