import express from 'express';
import cors from 'cors';
import historyRoutes from './routes/historyRoutes';
import graphqlEndpointHistoryRoutes from './routes/graphqlEndpointHistoryRoutes';
import testRoutes from './routes/testRoutes';
import { AppDataSource } from './config/database';

const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`\n=== INCOMING REQUEST ===`);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Origin:', req.headers.origin);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

// Parse JSON bodies (only once)
app.use(express.json());

// Log request body for POST/PUT requests
app.use((req, res, next) => {
    if (['POST', 'PUT'].includes(req.method)) {
        console.log('Request Body:', req.body);
        console.log('Content-Type:', req.get('Content-Type'));
    }
    next();
});

// Test endpoint
app.get('/test-endpoint', (req, res) => {
    console.log('Test endpoint hit!');
    res.json({ status: 'ok', message: 'Backend is working!' });
});

// Echo endpoint for testing
app.post('/api/echo', (req, res) => {
    console.log('Echo endpoint hit!');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    res.json({
        status: 'ok',
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/history', historyRoutes);
app.use('/api/graphql-endpoints', graphqlEndpointHistoryRoutes);
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
