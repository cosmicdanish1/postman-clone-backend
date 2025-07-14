import 'reflect-metadata';
import dotenv from 'dotenv';
import { app } from './app';
import { AppDataSource, dbConnection } from './config/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start the server
const startServer = async () => {
    try {
        console.log('Starting server...');
        console.log('Environment:', NODE_ENV);
        console.log('Port:', PORT);
        
        // Initialize database connection
        console.log('Initializing database connection...');
        await dbConnection;
        console.log('Database connected successfully');
        
        // Start the Express server
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            console.log('Available endpoints:');
            console.log(`- GET    http://localhost:${PORT}/api/health`);
            console.log(`- POST   http://localhost:${PORT}/api/history`);
            console.log(`- GET    http://localhost:${PORT}/api/history`);
        });

        // Handle graceful shutdown
        const gracefulShutdown = async () => {
            console.log('\n🛑 Shutting down server...');
            
            server.close(async () => {
                console.log('✅ Server closed');
                
                // Close database connection if needed
                if (AppDataSource.isInitialized) {
                    await AppDataSource.destroy();
                    console.log('✅ Database connection closed');
                }
                
                process.exit(0);
            });

            // Force close server after 5 seconds
            setTimeout(() => {
                console.error('❌ Forcing server shutdown');
                process.exit(1);
            }, 5000);
        };

        // Handle termination signals
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Consider whether to exit the process here
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    // Consider whether to exit the process here
    // process.exit(1);
});

// Start the application
startServer();
