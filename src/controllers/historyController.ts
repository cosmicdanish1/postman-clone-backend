import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { RequestHistory } from '../entities/RequestHistory';
import { makeRequest } from '../utils/apiClient';

const historyRepository = AppDataSource.getRepository(RequestHistory);

// Save API request to history
export const createHistory = async (req: Request, res: Response) => {
    try {
        const { method, url, headers, body } = req.body;
        
        if (!method || !url) {
            return res.status(400).json({ message: 'Method and URL are required' });
        }

        // Make the API call
        const startTime = Date.now();
        const response = await makeRequest({
            method: method || 'GET',  
            url,
            headers: headers || {},
            data: body,
            validateStatus: () => true, // To ensure we get the response even for error statuses
        });
        const responseTime = Date.now() - startTime;

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

        await historyRepository.save(history);

        res.status(201).json({
            data: response.data,
            status: response.status,
            headers: response.headers,
            responseTime: `${responseTime}ms`,
            historyId: history.id
        });
    } catch (error) {
        console.error('Error creating history:', error);
        res.status(500).json({ 
            message: 'Failed to process request', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

// Get all history entries
export const getHistory = async (req: Request, res: Response) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const [items, count] = await historyRepository.findAndCount({
            order: { created_at: 'DESC' },
            take: Number(limit),
            skip: Number(offset)
        });
        
        res.json({ 
            items: items.map(item => ({
                id: item.id,
                method: item.method,
                url: item.url,
                month: item.month,
                day: item.day,
                year: item.year,
                time: item.time,
                createdAt: item.created_at
            })), 
            count 
        });
    } catch (error) {
        console.error('Error in getHistory:', error);
        res.status(500).json({ 
            message: 'Error fetching history', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
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
