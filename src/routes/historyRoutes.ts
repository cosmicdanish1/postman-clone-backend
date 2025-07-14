import { Router } from 'express';
import * as historyController from '../controllers/historyController';

const router = Router();

// Execute an API request without saving to history
router.post('/execute', historyController.executeRequest);

// Create a new history entry (saves the request and response)
router.post('/', historyController.createHistory);

// Get all history entries with pagination
router.get('/', historyController.getHistory);

// Get a single history entry by ID
router.get('/:id', historyController.getHistoryById);

// Test endpoint
router.get('/test', historyController.testEndpoint);

// Clear all history
router.delete('/', historyController.clearHistory);

// Delete a history entry
router.delete('/:id', historyController.deleteHistory);

// Clear all history
router.delete('/', historyController.clearHistory);

export default router;
