import express from 'express';
import cors from 'cors';
import historyRoutes from './routes/historyRoutes';
import testRoutes from './routes/testRoutes';
import { AppDataSource } from './config/database';

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend is running on port 5173
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/history', historyRoutes);
app.use('/api/test', testRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : {} });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

export { app };
