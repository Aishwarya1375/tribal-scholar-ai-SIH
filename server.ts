import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { app } from './backend/app.ts';
import { db } from './backend/config/db.ts';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  await db.init();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`🇮🇳 MoTA AI Scholarship & Fellowship Management System`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Backend Health: http://localhost:${PORT}/api/health`);
    console.log(`🤖 AI Service Health: http://localhost:${PORT}/ai/health`);
    console.log(`================================================================`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup failure:', err);
});
