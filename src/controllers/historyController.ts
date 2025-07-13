import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { History } from '../models/History';
import { makeRequest } from '../utils/apiClient';

const historyRepository = AppDataSource.getRepository(History);

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
        const history = new History({
            method,
            url,
            requestHeaders: headers || null,
            requestBody: body ? JSON.stringify(body) : null,
            statusCode: response.status || null,
            responseHeaders: response.headers || null,
            responseBody: response.data ? JSON.stringify(response.data) : null,
            responseTime,
        });

        const savedHistory = await history.save();
        
        // Return both the API response and history ID
        res.status(201).json({
            ...response,
            historyId: savedHistory.id,
            responseTime: `${responseTime}ms`,
        });
    } catch (error) {
        console.error('Error in createHistory:', error);
        res.status(500).json({ 
            message: 'Error making API request', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

// Get all history entries
export const getHistory = async (req: Request, res: Response) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const query = historyRepository
            .createQueryBuilder('history')
            .select([
                'history.id',
                'history.method',
                'history.url',
                'history.statusCode',
                'history.responseTime',
                'history.createdAt'
            ])
            .orderBy('history.createdAt', 'DESC')
            .take(Number(limit))
            .skip(Number(offset));

        const [items, count] = await query.getManyAndCount();
        
        res.json({ items, count });
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
            // Parse the JSON fields
            const response = {
                ...history,
                requestHeaders: history.requestHeaders ? JSON.parse(history.requestHeaders as any) : null,
                responseHeaders: history.responseHeaders ? JSON.parse(history.responseHeaders as any) : null,
                requestBody: history.requestBody ? JSON.parse(history.requestBody) : null,
                responseBody: history.responseBody ? JSON.parse(history.responseBody) : null,
            };
            
            res.json(response);
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
