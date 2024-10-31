import request from 'supertest';
import { app, db } from '../app';

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.end();
});

describe('Route Tests', () => {
  test('GET /register should render the register page', async () => {
    const response = await request(app).get('/register');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Register for the Peer Evaluation Web App!');
  });

  test('GET /login should render login page', async () => {
    const response = await request(app).get('/login');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Login');
  });

  // Additional POST and authenticated route tests
});
