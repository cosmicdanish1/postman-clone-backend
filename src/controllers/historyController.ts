import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { RequestHistory, HTTP_METHODS } from '../entities/RequestHistory';
import { makeRequest } from '../utils/apiClient';

const historyRepository = AppDataSource.getRepository(RequestHistory);

// Save API request to history
export const createHistory = async (req: Request, res: Response) => {
    const requestId = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toISOString();
    
    console.log('\n=== BACKEND: Incoming Request ===');
    console.log(`[${timestamp}] Request ID: ${requestId}`);
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    
    // Log request details
    console.log('\n=== Request Headers ===');
    console.log(JSON.stringify(req.headers, null, 2));
    
    console.log('\n=== Request Body ===');
    console.log(req.body);
    
    console.log('\n=== Request Details ===');
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Content-Length:', req.get('Content-Length') || '0');
    
    try {
        const { method, url, month, day, year, time } = req.body;
        
        console.log('Extracted data:', { method, url, month, day, year, time });
        
        // Validate required fields
        if (!method || !url) {
            const errorMsg = `Missing required fields. Method: ${method}, URL: ${url}`;
            console.error('Validation error:', errorMsg);
            return res.status(400).json({ 
                success: false,
                message: 'Method and URL are required',
                received: { method, url },
                fullBody: req.body
            });
        }
        
        // Validate HTTP method
        if (!HTTP_METHODS.includes(method.toUpperCase() as any)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid HTTP method',
                received: method,
                validMethods: HTTP_METHODS
            });
        }

        console.log('Creating history entry with:', { method, url });

        // Create and save history
        const history = new RequestHistory();
        history.method = method; // TypeScript will handle the type checking
        history.url = url;
        
        // Set current date and time
        const now = new Date();
        history.month = String(now.getMonth() + 1).padStart(2, '0');
        history.day = String(now.getDate()).padStart(2, '0');
        history.year = String(now.getFullYear());
        history.time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        history.created_at = now;

        console.log('Prepared history entry:', JSON.stringify(history, null, 2));
        
        try {
            console.log('Attempting to save to database...');
            const savedHistory = await historyRepository.save(history);
            console.log('✅ History saved successfully. ID:', savedHistory.id);
            
            const responseData = {
                success: true,
                message: 'Request saved to history',
                historyId: savedHistory.id,
                data: {
                    method: savedHistory.method,
                    url: savedHistory.url,
                    date: `${savedHistory.year}-${savedHistory.month}-${savedHistory.day}`,
                    time: savedHistory.time,
                    createdAt: savedHistory.created_at
                }
            };
            
            console.log('Sending response:', JSON.stringify(responseData, null, 2));
            return res.status(201).json(responseData);
            
        } catch (dbError: any) {
            console.error('❌ Database save error:', {
                name: dbError.name,
                message: dbError.message,
                code: dbError.code,
                sql: dbError.sql,
                stack: dbError.stack
            });
            
            if (dbError.code === 'ER_NO_SUCH_TABLE') {
                console.error('❌ Database table does not exist. Please run migrations.');
            }
            
            throw dbError;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error in createHistory:', {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : 'No stack trace',
            requestBody: req.body
        });
        
        res.status(500).json({ 
            success: false,
            message: 'Failed to save request to history',
            error: errorMessage,
            requestData: {
                body: req.body,
                headers: req.headers
            }
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
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const result = await historyRepository
      .createQueryBuilder()
      .delete()
      .from(RequestHistory)
      .where('id = :id', { id })
      .execute();

    if (result.affected === 0) {
      return res.status(404).json({
        success: false,
        message: 'History item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'History item deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting history item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Clear all history
export const clearHistory = async (req: Request, res: Response) => {
  try {
    const result = await historyRepository
      .createQueryBuilder()
      .delete()
      .from(RequestHistory)
      .execute();
      
    console.log('Cleared history. Rows affected:', result.affected);
    
    // Return success response
    res.status(200).json({ 
      success: true,
      message: 'History cleared successfully',
      count: result.affected || 0
    });
  } catch (error) {
    console.error('Error in clearHistory:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error clearing history', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const historyItem = await historyRepository.findOne({ where: { id } });
    if (!historyItem) {
      return res.status(404).json({
        success: false,
        message: 'History item not found'
      });
    }

    historyItem.is_favorite = !historyItem.is_favorite;
    await historyRepository.save(historyItem);

    res.status(200).json({
      success: true,
      message: 'Favorite status updated successfully',
      is_favorite: historyItem.is_favorite
    });
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating favorite status',
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
