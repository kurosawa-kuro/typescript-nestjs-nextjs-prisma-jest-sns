import { Test, TestingModule } from '@nestjs/testing';

export const createMockPrismaService = () => ({
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  micropost: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
});

export const setupTestModule = async (controllers: any[], providers: any[]) => {
  const module: TestingModule = await Test.createTestingModule({
    controllers,
    providers,
  }).compile();

  return module;
};

export const createMockService = (serviceMethods: string[]) => {
  const mockService = {};
  serviceMethods.forEach((method) => {
    mockService[method] = jest.fn();
  });
  return mockService;
};
