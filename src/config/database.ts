import { DataSource } from 'typeorm';
import 'dotenv/config';
import { RequestHistory } from '../entities/RequestHistory';

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.log('Please create a .env file based on .env.example');
    process.exit(1);
}

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true, // Set to false in production
    logging: process.env.NODE_ENV === 'development',
    entities: [RequestHistory],
    migrations: [],
    subscribers: [],
    charset: 'utf8mb4',
    timezone: 'Z',
    connectTimeout: 10000, // 10 seconds
    acquireTimeout: 10000, // 10 seconds
    extra: {
        connectionLimit: 10,
    },
});

// Test database connection
async function initializeDatabase() {
    try {
        const connection = await AppDataSource.initialize();
        console.log('✅ Database connected successfully');
        return connection;
    } catch (error) {
        console.error('❌ Error connecting to database:', error);
        process.exit(1);
    }
}

// Initialize the database connection
export const dbConnection = initializeDatabase();

export { AppDataSource };
