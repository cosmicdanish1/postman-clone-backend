import { DataSource } from 'typeorm';
import { RequestHistory } from './entities/RequestHistory';

console.log('🚀 Starting simple database test...');

// Create a new connection
const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'postman_clone',
    entities: [RequestHistory],
    synchronize: false,
    logging: true
});

async function testConnection() {
    console.log('\n📡 Attempting to connect to database...');
    
    try {
        const connection = await AppDataSource.initialize();
        console.log('✅ Successfully connected to the database!');
        
        // Try a simple query
        console.log('\n🔍 Running test query...');
        const count = await connection.manager.count(RequestHistory);
        console.log(`✅ Found ${count} records in request_history table`);
        
        // Show first few records if any
        if (count > 0) {
            const records = await connection.manager.find(RequestHistory, { take: 3 });
            console.log('\n📋 Sample records:');
            console.log(JSON.stringify(records, null, 2));
        }
        
        await connection.destroy();
        console.log('\n🔌 Connection closed.');
        
    } catch (error) {
        console.error('\n❌ Error:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Is MySQL server running?');
        console.log('2. Check if the database exists: mysql -u root -e "CREATE DATABASE IF NOT EXISTS postman_clone;"');
        console.log('3. Check your database credentials');
    }
}

testConnection();
