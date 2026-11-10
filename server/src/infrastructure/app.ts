import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { Router } from 'express';

export function createApp(apiRouter: Router): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', apiRouter);

  // Entrega estática do frontend React (Vite) quando compilado
  const clientDistPath = path.resolve(process.cwd(), '..', 'client', 'dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  return app;
}
