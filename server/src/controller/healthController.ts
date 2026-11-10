import { Request, Response } from 'express';

export class HealthController {
  getHealth(_req: Request, res: Response): void {
    res.json({ status: 'ok', service: '4z AI Code Challenges API' });
  }
}
