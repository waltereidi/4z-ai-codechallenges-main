import path from 'path';
import dotenv from 'dotenv';

// Carrega .env do diretório do backend ou da raiz do projeto
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AppConfig {
  port: number;
  altPort: number;
  dbPath: string;
  nodeEnv: string;
  corsOrigin: string;
}

export function loadConfig(): AppConfig {
  const port = Number(process.env.PORT) || 5000;
  const altPort = Number(process.env.ALT_PORT) || (port === 5000 ? 5173 : 5000);
  const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), '..', 'shark_tank.db');
  const nodeEnv = process.env.NODE_ENV || 'development';
  const corsOrigin = process.env.CORS_ORIGIN || '*';

  return {
    port,
    altPort,
    dbPath,
    nodeEnv,
    corsOrigin
  };
}
