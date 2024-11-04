// user.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/core/database/prisma.service';
import { setupTestApp, cleanupDatabase, createTestUser } from './test-utils';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    ({ app, prismaService } = await setupTestApp());
  });

  afterAll(async () => {
    await cleanupDatabase(prismaService);
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase(prismaService);
  });

  it('/auth/register (POST)', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(newUser)
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Registration successful',
      token: expect.any(String),
      user: {
        id: expect.any(Number),
        name: newUser.name,
        email: newUser.email,
        userRoles: ['general'],
        profile: {
          avatarPath: expect.any(String),
        },
      },
    });

    expect(response.headers['set-cookie'][0]).toContain('jwt=');
  });

  it('/auth/login (POST)', async () => {
    const testUser = {
      name: 'Test User',
      email: `test${Math.random().toString(36).substring(2, 7)}@example.com`,
      password: 'testPassword123',
      avatarPath: 'path/to/avatar.jpg',
    };
    await createTestUser(prismaService, testUser);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Login successful',
      token: expect.any(String),
      user: {
        id: expect.any(Number),
        name: testUser.name,
        email: testUser.email,
        userRoles: ['general'],
        profile: {
          avatarPath: testUser.avatarPath,
        },
      },
    });
  });

  it('/auth/logout (POST)', async () => {
    // First, register a user and get the token
    const newUser = {
      name: 'Logout Test User',
      email: 'logout@example.com',
      password: 'password123',
    };

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(newUser)
      .expect(201);

    const token = registerResponse.body.token;

    // Now, use this token to logout
    const logoutResponse = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);  // Change this from 200 to 201

    expect(logoutResponse.body).toEqual({ message: 'Logout successful' });
    
    // Check that the cookie has been cleared
    expect(logoutResponse.headers['set-cookie'][0]).toMatch(/jwt=;/);
  });

  it('/auth/me (GET)', async () => {
    // First, register a user and get the token
    const newUser = {
      name: 'Me Test User',
      email: 'me@example.com',
      password: 'password123',
    };

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(newUser)
      .expect(201);

    const token = registerResponse.body.token;

    // Now, use this token to get user info
    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meResponse.body).toMatchObject({
      id: expect.any(Number),
      name: newUser.name,
      email: newUser.email,
      userRoles: ['general'],
      profile: {
        avatarPath: expect.any(String),
      },
    });
  });

  it('/auth/me (GET) - Unauthorized', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);

    expect(response.body).toMatchObject({
      message: 'Unauthorized',
      statusCode: 401,
      path: '/auth/me',
      success: false,
      errorResponse: {
        error: 'Unauthorized',
        message: 'No token provided',
        statusCode: 401,
      },
    });

    // Check that timestamp is present and is a valid date
    expect(response.body.timestamp).toBeDefined();
    expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});
