import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { db } from './backend/config/db.ts';

// Routes
import authRoutes from './backend/routes/authRoutes.ts';
import studentRoutes from './backend/routes/studentRoutes.ts';
import documentRoutes from './backend/routes/documentRoutes.ts';
import deficiencyRoutes from './backend/routes/deficiencyRoutes.ts';
import adminRoutes from './backend/routes/adminRoutes.ts';
import schemeRoutes from './backend/routes/schemeRoutes.ts';
import assistantRoutes from './backend/routes/assistantRoutes.ts';
import notificationRoutes from './backend/routes/notificationRoutes.ts';
import selectionRoutes from './backend/routes/selectionRoutes.ts';
import grievanceRoutes from './backend/routes/grievanceRoutes.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check Endpoints (Phase 0 Checkpoint)
app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    success: true,
    service: 'MoTA-Scholarship-Backend',
    database: db.isConnectedToMongo ? 'MongoDB' : 'In-Memory-Persisted (Zero-Dependency Engine)',
    timestamp: new Date().toISOString()
  });
});

app.get(['/ai/health', '/api/ai/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    success: true,
    service: 'MoTA-AI-Document-Intelligence',
    engine: process.env.GROQ_API_KEY ? 'Groq Llama-3.3-70b + Local OCR Scrutiny Engine' : 'Local Rule-Based Scrutiny Engine',
    fallbackAvailable: true,
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/deficiencies', deficiencyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/selection', selectionRoutes);
app.use('/api/grievances', grievanceRoutes);

// Serve sample documents if requested
app.use('/sample-documents', express.static(path.resolve(process.cwd(), 'sample-documents')));

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
