import 'dotenv/config';
import { AppDataSource } from './config/database';
import { RequestHistory } from './entities/RequestHistory';

async function checkDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    
    try {
        console.log('📡 Connecting to database...');
        console.log(`   Host: ${process.env.DB_HOST}`);
        console.log(`   Database: ${process.env.DB_NAME}`);
        console.log(`   User: ${process.env.DB_USER}`);
        
        // Initialize the database connection
        const connection = await AppDataSource.initialize();
        console.log('✅ Database connection successful!');
        
        // Test a simple query
        console.log('🔍 Running test query...');
        try {
            const count = await connection.manager.count(RequestHistory);
            console.log(`✅ Test query successful. Found ${count} records in RequestHistory table.`);
            
            // Show table structure
            const metadata = connection.getMetadata(RequestHistory);
            console.log('\n📋 Table structure:');
            console.log(`   Table name: ${metadata.tableName}`);
            console.log('   Columns:');
            metadata.columns.forEach(column => {
                console.log(`   - ${column.propertyName}: ${column.type}${column.isNullable ? ' (nullable)' : ''}`);
            });
        } catch (queryError) {
            console.error('❌ Test query failed:', queryError);
            console.log('This might be because the table does not exist yet.');
        }
        
        // Close the connection
        await connection.destroy();
        console.log('\n🔌 Database connection closed.');
        process.exit(0);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('\n❌ Database connection failed:', errorMessage);
        
        // Provide troubleshooting tips
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Check if your database server is running');
        console.log('2. Verify the database credentials in your .env file');
        console.log('3. Ensure the database exists and the user has proper permissions');
        console.log('4. Check if the database server is accessible from your network');
        
        process.exit(1);
    }
}

// Run the check
console.log('🚀 Starting database connection test...\n');
checkDatabaseConnection();
