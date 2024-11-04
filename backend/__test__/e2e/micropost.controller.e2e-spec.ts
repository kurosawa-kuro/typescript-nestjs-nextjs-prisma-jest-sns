// micropost.controller.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/core/database/prisma.service';
import {
  setupTestApp,
  cleanupDatabase,
  createTestUser,
  createTestMicropost,
  loginTestUser,
} from './test-utils';
import * as path from 'path';
import * as fs from 'fs';

describe('MicropostController (e2e)', () => {
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

  describe('GET /microposts', () => {
    it('should return all microposts for authenticated user', async () => {
      // Arrange
      const testUser = await createTestUserWithMicroposts(prismaService);
      const { token } = await loginTestUser(app, testUser.email, 'password123');

      // Act
      const response = await request(app.getHttpServer())
        .get('/microposts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expectValidMicropost(response.body[0], testUser.id);
    });
  });

  describe('POST /microposts', () => {
    it('should create a new micropost with image', async () => {
      // Arrange
      const testUser = await createTestUser(prismaService, {
        email: 'test@example.com',
        password: 'password123',
      });
      const { token } = await loginTestUser(app, testUser.email, 'password123');
      
      // 正しい画像パスを使用
      const testImagePath = path.join(process.cwd(), 'uploads', 'test.png');
      
      // 画像ファイルが存在することを確認
      expect(fs.existsSync(testImagePath)).toBeTruthy();
      
      // Act
      const response = await request(app.getHttpServer())
        .post('/microposts')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'My First Post')
        .field('categoryIds', JSON.stringify([]))
        .attach('image', testImagePath, 'test.png')
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        title: 'My First Post',
        user: {
          id: testUser.id,
          name: expect.any(String)
        },
        imagePath: expect.stringMatching(/.*\.png$/),
        likesCount: 0,
        viewsCount: 0,
        comments: [],
        categories: []
      });
    });
  });
});

// Helper functions
async function createTestUserWithMicroposts(prismaService: PrismaService) {
  const testUser = await createTestUser(prismaService, {
    email: 'test@example.com',
    password: 'password123',
  });

  await Promise.all([
    createTestMicropost(prismaService, testUser.id),
    createTestMicropost(prismaService, testUser.id)
  ]);

  return testUser;
}

function expectValidMicropost(micropost: any, userId: number) {
  expect(micropost).toHaveProperty('id');
  expect(micropost).toHaveProperty('title');
  expect(micropost).toHaveProperty('imagePath');
  expect(micropost.user).toHaveProperty('id', userId);
  expect(micropost).toHaveProperty('likesCount');
  expect(micropost).toHaveProperty('viewsCount');
  expect(micropost).toHaveProperty('categories');
  expect(micropost).toHaveProperty('comments');
}
