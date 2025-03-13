import request from 'supertest';
import app from '../index.js';

describe('Event Planner API', () => {
    it('should register a new user', async () => {
        const res = await request(app).post('/register').send({
            username: 'testuser',
            password: 'password123'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('User registered successfully');
    });
});
