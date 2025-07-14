import { Router } from 'express';

const router = Router();

// Test endpoint to verify backend is working
router.get('/test-data', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Backend is working!',
        timestamp: new Date().toISOString()
    });
});

export default router;
