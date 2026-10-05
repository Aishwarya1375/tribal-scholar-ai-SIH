import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';

import { db } from './config/db.ts';
import authRoutes from './routes/authRoutes.ts';
import studentRoutes from './routes/studentRoutes.ts';
import documentRoutes from './routes/documentRoutes.ts';
import deficiencyRoutes from './routes/deficiencyRoutes.ts';
import adminRoutes from './routes/adminRoutes.ts';
import schemeRoutes from './routes/schemeRoutes.ts';
import assistantRoutes from './routes/assistantRoutes.ts';
import notificationRoutes from './routes/notificationRoutes.ts';
import selectionRoutes from './routes/selectionRoutes.ts';
import grievanceRoutes from './routes/grievanceRoutes.ts';

const app = express();

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

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

app.use('/sample-documents', express.static(path.resolve(process.cwd(), 'sample-documents')));

export { app };
