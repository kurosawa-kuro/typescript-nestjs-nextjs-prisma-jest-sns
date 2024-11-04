import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/core/database/prisma.service';
import { User, Micropost, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';

export const setupTestApp = async (): Promise<{
  app: INestApplication;
  prismaService: PrismaService;
}> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser());  // この行を追加
  await app.init();

  const prismaService = app.get<PrismaService>(PrismaService);
  await prismaService.$connect();

  return { app, prismaService };
};

export const cleanupDatabase = async (
  prismaService: PrismaService,
): Promise<void> => {
  await prismaService.$transaction([
    prismaService.like.deleteMany(),
    prismaService.comment.deleteMany(),
    prismaService.categoryMicropost.deleteMany(),
    prismaService.micropost.deleteMany(),
    prismaService.careerProject.deleteMany(),
    prismaService.careerSkill.deleteMany(),
    prismaService.career.deleteMany(),
    prismaService.userSkill.deleteMany(),
    prismaService.teamMember.deleteMany(),
    prismaService.follow.deleteMany(),
    prismaService.userRole.deleteMany(),
    prismaService.userProfile.deleteMany(),
    prismaService.user.deleteMany(),
    prismaService.role.deleteMany(),
    prismaService.skill.deleteMany(),
    prismaService.category.deleteMany(),
    prismaService.team.deleteMany(),
  ]);
};

interface TestUserData {
  name?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
  avatarPath?: string;
}

const defaultUserData: TestUserData = {
  name: 'Test User',
  email: `test${Math.random().toString(36).substring(2, 7)}@example.com`,
  password: 'testPassword123',
  isAdmin: false,
  avatarPath: 'path/to/avatar.jpg',
};

export const createTestUser = async (
  prismaService: PrismaService,
  userData: TestUserData = {}
): Promise<User> => {
  const mergedData = { ...defaultUserData, ...userData };
  const hashedPassword = await bcrypt.hash(mergedData.password, 10);

  // Ensure roles exist
  const roles = ['general', 'admin'];
  await Promise.all(roles.map(roleName => 
    prismaService.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `${roleName} role` },
    })
  ));

  return prismaService.user.create({
    data: {
      name: mergedData.name,
      email: mergedData.email,
      password: hashedPassword,
      userRoles: {
        create: {
          role: { connect: { name: mergedData.isAdmin ? 'admin' : 'general' } }
        }
      },
      profile: {
        create: {
          avatarPath: mergedData.avatarPath
        }
      }
    },
    include: {
      userRoles: {
        include: {
          role: true
        }
      },
      profile: true
    }
  });
};

interface TestMicropostData {
  title?: string;
  imagePath?: string;
}

const defaultMicropostData: TestMicropostData = {
  title: 'Test Title',
  imagePath: 'test.jpg',
};

export const createTestMicropost = async (
  prismaService: PrismaService,
  userId: number,
  micropostData: TestMicropostData = {}
): Promise<Micropost> => {
  const mergedData = { ...defaultMicropostData, ...micropostData };

  return prismaService.micropost.create({
    data: {
      userId,
      title: mergedData.title,
      imagePath: mergedData.imagePath,
    },
  });
};

export const loginTestUser = async (
  app: INestApplication,
  email: string,
  password: string
): Promise<{ token: string; user: User }> => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  return {
    token: response.body.token,
    user: response.body.user,
  };
};
