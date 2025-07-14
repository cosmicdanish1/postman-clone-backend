import request from 'supertest';
import { app } from '../app';

describe('Health Check', () => {
    it('should return 200 and status ok', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('timestamp');
    });
});
