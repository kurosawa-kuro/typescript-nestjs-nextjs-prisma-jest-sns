import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from '@/features/like/like.service';
import { PrismaService } from '@/core/database/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('LikeService', () => {
  let service: LikeService;
  let prismaService: PrismaService;

  const mockLike = {
    id: 1,
    userId: 1,
    micropostId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeService,
        {
          provide: PrismaService,
          useValue: {
            like: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LikeService>(LikeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new like', async () => {
      jest.spyOn(prismaService.like, 'create').mockResolvedValue(mockLike);

      const result = await service.create(1, 1);
      expect(result).toEqual(mockLike);
      expect(prismaService.like.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 1 } },
          micropost: { connect: { id: 1 } },
        },
      });
    });

    it('should throw ConflictException when user has already liked the post', async () => {
      jest.spyOn(prismaService.like, 'create').mockRejectedValue({ code: 'P2002' });

      await expect(service.create(1, 1)).rejects.toThrow(ConflictException);
      await expect(service.create(1, 1)).rejects.toThrow('User has already liked this micropost');
    });

    it('should throw original error for other create errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(prismaService.like, 'create').mockRejectedValue(error);

      await expect(service.create(1, 1)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should remove a like', async () => {
      jest.spyOn(prismaService.like, 'findUnique').mockResolvedValue(mockLike);
      jest.spyOn(prismaService.like, 'delete').mockResolvedValue(mockLike);

      const result = await service.remove(1, 1);
      expect(result).toEqual(mockLike);
      expect(prismaService.like.delete).toHaveBeenCalledWith({
        where: { id: mockLike.id },
      });
    });

    it('should throw NotFoundException when like not found', async () => {
      jest.spyOn(prismaService.like, 'findUnique').mockResolvedValue(null);

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
      await expect(service.remove(1, 1)).rejects.toThrow('Like not found');
    });
  });

  describe('getLikeCount', () => {
    it('should return the number of likes for a micropost', async () => {
      const expectedCount = 5;
      jest.spyOn(prismaService.like, 'count').mockResolvedValue(expectedCount);

      const result = await service.getLikeCount(1);
      expect(result).toBe(expectedCount);
      expect(prismaService.like.count).toHaveBeenCalledWith({
        where: { micropostId: 1 },
      });
    });
  });

  describe('hasUserLiked', () => {
    it('should return true when user has liked the post', async () => {
      jest.spyOn(prismaService.like, 'findUnique').mockResolvedValue(mockLike);

      const result = await service.hasUserLiked(1, 1);
      expect(result).toBe(true);
      expect(prismaService.like.findUnique).toHaveBeenCalledWith({
        where: {
          userId_micropostId: {
            userId: 1,
            micropostId: 1,
          },
        },
      });
    });

    it('should return false when user has not liked the post', async () => {
      jest.spyOn(prismaService.like, 'findUnique').mockResolvedValue(null);

      const result = await service.hasUserLiked(1, 1);
      expect(result).toBe(false);
    });
  });
});
