import { Test, TestingModule } from '@nestjs/testing';
import { MicropostService } from '@/features/micropost/micropost.service';
import { PrismaService } from '@/core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MicropostService', () => {
  let service: MicropostService;
  let prismaService: PrismaService;

  const mockMicropost = {
    id: 1,
    userId: 1,
    title: 'Test Post',
    imagePath: 'test.jpg',
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 1,
      name: 'Test User',
      profile: {
        avatarPath: 'avatar.jpg',
      },
    },
    _count: {
      likes: 0,
      views: 0,
    },
    comments: [],
    categories: [],
    likes: [],
  };

  const mockPrismaClient = {
    micropost: {
      create: jest.fn().mockImplementation((args) => Promise.resolve({ ...mockMicropost, ...args.data })),
      findMany: jest.fn().mockResolvedValue([mockMicropost]),
      findUnique: jest.fn().mockResolvedValue(mockMicropost),
      delete: jest.fn().mockResolvedValue(mockMicropost),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicropostService,
        {
          provide: PrismaService,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    service = module.get<MicropostService>(MicropostService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a micropost', async () => {
      const micropostData = {
        title: 'Test Post',
        userId: 1,
        imagePath: 'test.jpg',
        categoryIds: [1, 2],
      };

      const mockCreatedMicropost = {
        ...mockMicropost,
        categories: [
          { category: { id: 1, name: 'Category 1' } },
          { category: { id: 2, name: 'Category 2' } },
        ],
      };

      jest.spyOn(prismaService.micropost, 'create')
        .mockResolvedValueOnce(mockCreatedMicropost as any);

      const result = await service.create(micropostData);

      expect(result).toEqual({
        id: mockCreatedMicropost.id,
        title: mockCreatedMicropost.title,
        imagePath: mockCreatedMicropost.imagePath,
        createdAt: mockCreatedMicropost.createdAt.toISOString(),
        updatedAt: mockCreatedMicropost.updatedAt.toISOString(),
        likesCount: mockCreatedMicropost._count.likes,
        viewsCount: mockCreatedMicropost._count.views,
        isLiked: undefined,
        user: {
          id: mockCreatedMicropost.user.id,
          name: mockCreatedMicropost.user.name,
        },
        comments: [],
        categories: [
          { id: 1, name: 'Category 1' },
          { id: 2, name: 'Category 2' },
        ],
      });
    });
  });

  describe('all', () => {
    it('should return all microposts', async () => {
      const mockMicroposts = [mockMicropost];
      jest.spyOn(prismaService.micropost, 'findMany')
        .mockResolvedValueOnce(mockMicroposts as any);

      const result = await service.all();

      expect(result).toEqual([{
        id: mockMicropost.id,
        title: mockMicropost.title,
        imagePath: mockMicropost.imagePath,
        createdAt: mockMicropost.createdAt.toISOString(),
        updatedAt: mockMicropost.updatedAt.toISOString(),
        likesCount: mockMicropost._count.likes,
        viewsCount: mockMicropost._count.views,
        isLiked: undefined,
        user: {
          id: mockMicropost.user.id,
          name: mockMicropost.user.name,
        },
        comments: [],
        categories: [],
      }]);
    });
  });

  describe('findById', () => {
    it('should find a micropost by id', async () => {
      const id = 1;
      jest.spyOn(prismaService.micropost, 'findUnique').mockResolvedValue(mockMicropost);

      const result = await service.findById(id);

      expect(result).toEqual({
        id: mockMicropost.id,
        title: mockMicropost.title,
        imagePath: mockMicropost.imagePath,
        createdAt: mockMicropost.createdAt.toISOString(),
        updatedAt: mockMicropost.updatedAt.toISOString(),
        likesCount: mockMicropost._count.likes,
        viewsCount: mockMicropost._count.views,
        isLiked: undefined,
        user: {
          id: mockMicropost.user.id,
          name: mockMicropost.user.name,
        },
        comments: [],
        categories: [],
      });
    });
  });

  describe('destroy', () => {
    it('should delete a micropost', async () => {
      const id = 1;
      jest.spyOn(prismaService.micropost, 'delete').mockResolvedValue(mockMicropost);

      const result = await service.destroy(id);

      expect(result).toEqual(mockMicropost);
    });

    it('should throw NotFoundException when micropost not found', async () => {
      const id = 999;
      jest.spyOn(prismaService.micropost, 'delete').mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.destroy(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should find microposts by user id', async () => {
      const userId = 1;
      const mockMicroposts = [mockMicropost];
      jest.spyOn(prismaService.micropost, 'findMany').mockResolvedValue(mockMicroposts);

      const result = await service.findByUserId(userId);

      expect(result).toEqual([{
        id: mockMicropost.id,
        title: mockMicropost.title,
        imagePath: mockMicropost.imagePath,
        createdAt: mockMicropost.createdAt.toISOString(),
        updatedAt: mockMicropost.updatedAt.toISOString(),
        likesCount: mockMicropost._count.likes,
        viewsCount: mockMicropost._count.views,
        isLiked: undefined,
        user: {
          id: mockMicropost.user.id,
          name: mockMicropost.user.name,
        },
        comments: [],
        categories: [],
      }]);
    });
  });
});
