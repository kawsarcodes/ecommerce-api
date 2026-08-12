import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import router from './routes';
import { globalErrorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running healthily',
    data: {}
  });
});

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    data: {}
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
