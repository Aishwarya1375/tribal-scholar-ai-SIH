import type { Request, Response } from 'express';
import { app } from './app.ts';
import { db } from './config/db.ts';

const databaseReady = db.init();

export default async function handleVercelRequest(req: Request, res: Response) {
  await databaseReady;
  app(req, res);
}
