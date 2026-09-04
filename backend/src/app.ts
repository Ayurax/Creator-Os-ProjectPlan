import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import creatorRoutes from './routes/creator.routes';
import brandRoutes from './routes/brand.routes';
import campaignRoutes from './routes/campaign.routes';
import collaborationRoutes from './routes/collaboration.routes';
import contractRoutes from './routes/contract.routes';
import taskRoutes from './routes/task.routes';
import paymentRoutes from './routes/payment.routes';
import reviewRoutes from './routes/review.routes';
import portfolioRoutes from './routes/portfolio.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import aiRoutes from './routes/ai.routes';

import { HttpError } from './utils/errors';

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('CreatorOS AI Backend is running!');
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;