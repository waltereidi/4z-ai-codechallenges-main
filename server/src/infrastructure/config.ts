import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  altPort: number;
  dbPath: string;
}

export function loadConfig(): AppConfig {
  const port = Number(process.env.PORT) || 5000;
  const altPort = Number(process.env.ALT_PORT) || (port === 5000 ? 5173 : 5000);
  const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), '..', 'shark_tank.db');

  return {
    port,
    altPort,
    dbPath
  };
}
