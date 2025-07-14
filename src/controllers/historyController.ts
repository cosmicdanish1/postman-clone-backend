import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { RequestHistory } from '../entities/RequestHistory';
import { makeRequest } from '../utils/apiClient';

const historyRepository = AppDataSource.getRepository(RequestHistory);

// Save API request to history
export const createHistory = async (req: Request, res: Response) => {
    console.log('=== createHistory endpoint hit ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
        const { method, url, headers, body } = req.body;
        
        if (!method || !url) {
            const errorMsg = 'Method and URL are required';
            console.error('Validation error:', errorMsg);
            return res.status(400).json({ 
                success: false,
                message: errorMsg 
            });
        }

        console.log('Creating history entry with method:', method, 'and URL:', url);

        // Create and save history
        const history = new RequestHistory();
        history.method = method as any; // Cast to HttpMethod
        history.url = url;
        
        // Set current date and time
        const now = new Date();
        history.month = String(now.getMonth() + 1).padStart(2, '0');
        history.day = String(now.getDate()).padStart(2, '0');
        history.year = String(now.getFullYear());
        history.time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        history.created_at = now;

        console.log('Saving history entry to database:', JSON.stringify(history, null, 2));
        
        try {
            const savedHistory = await historyRepository.save(history);
            console.log('History saved successfully with ID:', savedHistory.id);
            
            res.status(201).json({
                success: true,
                message: 'Request saved to history',
                historyId: savedHistory.id,
                data: {
                    method: savedHistory.method,
                    url: savedHistory.url,
                    date: `${savedHistory.year}-${savedHistory.month}-${savedHistory.day}`,
                    time: savedHistory.time
                }
            });
        } catch (error: any) {
            console.error('Database save error:', error);
            if (error.code === 'ER_NO_SUCH_TABLE') {
                console.error('Database table does not exist. Please run migrations.');
            }
            throw error;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in createHistory:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to save request to history',
            error: errorMessage 
        });
    }
};

// Get all history entries
export const getHistory = async (req: Request, res: Response) => {
    console.log('\n=== GET /api/history called ===');
    console.log('Query params:', req.query);
    
    try {
        const { limit = 50, offset = 0 } = req.query;
        console.log(`Fetching up to ${limit} history items with offset ${offset}...`);

        const [items, count] = await historyRepository.findAndCount({
            order: { created_at: 'DESC' },
            take: Number(limit),
            skip: Number(offset)
        });

        console.log(`Found ${items.length} items in database`);
        
        // Log first item's structure
        if (items.length > 0) {
            const sample = items[0];
            console.log('Sample database item:', {
                id: sample.id,
                method: sample.method,
                url: sample.url,
                month: sample.month,
                day: sample.day,
                year: sample.year,
                time: sample.time,
                created_at: sample.created_at
            });
        }

        const responseData = { 
            items: items.map(item => ({
                id: item.id,
                method: item.method,
                url: item.url,
                month: item.month,
                day: item.day,
                year: item.year,
                time: item.time,
                created_at: item.created_at
            })), 
            count 
        };

        console.log('Sending response with items:', responseData.items.length > 0 ? 'Yes' : 'No');
        res.json(responseData);
        
    } catch (error) {
        console.error('Error in getHistory:', error);
        res.status(500).json({ 
            message: 'Error fetching history', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

// Test endpoint for debugging
export const testEndpoint = async (req: Request, res: Response) => {
    console.log('\n=== Test endpoint called ===');
    
    // Return test data in the exact format we expect
    const testData = {
        items: [{
            id: 999,
            method: 'GET',
            url: 'https://example.com/test',
            month: '07',
            day: '14',
            year: '2023',
            time: '14:30:00',
            created_at: new Date().toISOString()
        }],
        count: 1
    };
    
    console.log('Sending test data:', testData);
    res.json(testData);
};

// Get detailed history by ID
export const getHistoryById = async (req: Request, res: Response) => {
    try {
        const history = await historyRepository.findOne({
            where: { id: Number(req.params.id) }
        });
        
        if (history) {
            res.json({
                id: history.id,
                method: history.method,
                url: history.url,
                month: history.month,
                day: history.day,
                year: history.year,
                time: history.time,
                createdAt: history.created_at
            });
        } else {
            res.status(404).json({ message: 'History not found' });
        }
    } catch (error) {
        console.error('Error in getHistoryById:', error);
        res.status(500).json({ 
            message: 'Error fetching history details', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

// Delete a history entry
export const deleteHistory = async (req: Request, res: Response) => {
    try {
        const result = await historyRepository.delete(Number(req.params.id));
        if (result.affected === 0) {
            return res.status(404).json({ message: 'History not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error in deleteHistory:', error);
        res.status(500).json({ 
            message: 'Error deleting history', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

// Clear all history
export const clearHistory = async (req: Request, res: Response) => {
    try {
        await historyRepository.clear();
        res.status(204).send();
    } catch (error) {
        console.error('Error in clearHistory:', error);
        res.status(500).json({ 
            message: 'Error clearing history', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

// Execute an API request without saving to history
export const executeRequest = async (req: Request, res: Response) => {
    try {
        const { method = 'GET', url, headers = {}, body } = req.body;
        
        if (!url) {
            return res.status(400).json({ message: 'URL is required' });
        }

        const startTime = Date.now();
        const response = await makeRequest({
            method,
            url,
            headers,
            data: body,
            validateStatus: () => true,
        });
        const responseTime = Date.now() - startTime;

        res.json({
            ...response,
            responseTime: `${responseTime}ms`,
        });
    } catch (error) {
        console.error('Error in executeRequest:', error);
        res.status(500).json({ 
            message: 'Error making API request', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};
