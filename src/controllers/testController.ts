import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { RequestHistory } from '../entities/RequestHistory';

export const testConnection = async (req: Request, res: Response) => {
    try {
        // Get the repository for RequestHistory
        const requestRepository = AppDataSource.getRepository(RequestHistory);
        
        // Try to find all records
        const allRequests = await requestRepository.find();
        
        // Try to count records
        const count = await requestRepository.count();
        
        res.status(200).json({
            success: true,
            message: 'Database connection successful!',
            recordCount: count,
            data: allRequests
        });
    } catch (error) {
        console.error('Database test failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Failed to connect to database',
            error: errorMessage
        });
    }
};

export const addTestData = async (req: Request, res: Response) => {
    try {
        const requestRepository = AppDataSource.getRepository(RequestHistory);
        
        // Create a test record
        const testRecord = requestRepository.create({
            method: 'GET',
            url: 'https://api.example.com/test',
            month: '07',
            day: '14',
            year: '2025',
            time: '02:54:14 PM'
        });
        
        // Save to database
        await requestRepository.save(testRecord);
        
        res.status(201).json({
            success: true,
            message: 'Test data added successfully',
            data: testRecord
        });
    } catch (error) {
        console.error('Failed to add test data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Failed to add test data',
            error: errorMessage
        });
    }
};
