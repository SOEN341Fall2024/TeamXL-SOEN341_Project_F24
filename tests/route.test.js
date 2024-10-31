import request from 'supertest';
import { app } from '../app.js';
import pg from 'pg';

let db;

beforeAll(async () => {
  db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
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
});
