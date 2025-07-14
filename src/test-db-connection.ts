import 'dotenv/config';
import { AppDataSource } from './config/database';
import { RequestHistory } from './entities/RequestHistory';

async function testDatabaseConnection() {
    console.log('🚀 Testing database connection and data retrieval...\n');
    
    try {
        console.log('📡 Connecting to database...');
        console.log(`   Host: ${process.env.DB_HOST}`);
        console.log(`   Database: ${process.env.DB_NAME}`);
        console.log(`   User: ${process.env.DB_USER}\n`);
        
        // Initialize the database connection
        const connection = await AppDataSource.initialize();
        console.log('✅ Database connection successful!');
        
        // Get the repository
        const historyRepository = connection.getRepository(RequestHistory);
        
        // Try to fetch all records
        console.log('\n🔍 Fetching all history records...');
        const allRecords = await historyRepository.find();
        
        console.log(`\n📋 Found ${allRecords.length} records in request_history table:`);
        allRecords.forEach((record, index) => {
            console.log(`\nRecord #${index + 1}:`);
            console.log(`   ID: ${record.id}`);
            console.log(`   Method: ${record.method}`);
            console.log(`   URL: ${record.url}`);
            console.log(`   Date: ${record.day}-${record.month}-${record.year} ${record.time}`);
            console.log(`   Created At: ${record.created_at}`);
        });
        
        // Close the connection
        await connection.destroy();
        console.log('\n🔌 Database connection closed.');
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('\n❌ Error:', errorMessage);
        
        if (errorMessage.includes('connect ECONNREFUSED')) {
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Is your MySQL server running?');
            console.log('2. Check if the host and port are correct');
        } else if (errorMessage.includes('ER_ACCESS_DENIED_ERROR')) {
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Check your database username and password in .env file');
            console.log('2. Verify the user has proper permissions');
        } else if (errorMessage.includes('ER_BAD_DB_ERROR')) {
            console.log('\n🔧 Troubleshooting:');
            console.log('1. The database does not exist');
            console.log('2. Create the database using: CREATE DATABASE postman_clone;');
        }
        
        process.exit(1);
    }
}

// Run the test
testDatabaseConnection();
