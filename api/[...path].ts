import type { Request, Response } from 'express';
import { app } from '../backend/app.ts';
import { db } from '../backend/config/db.ts';

const databaseReady = db.init();

export default async function handler(req: Request, res: Response) {
  await databaseReady;
  app(req, res);
}
