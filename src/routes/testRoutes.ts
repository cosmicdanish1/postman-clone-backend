import { Router } from 'express';
import { testConnection, addTestData } from '../controllers/testController';

const router = Router();

// Test database connection
router.get('/test-db', testConnection);

// Add test data
router.post('/test-data', addTestData);

export default router;
