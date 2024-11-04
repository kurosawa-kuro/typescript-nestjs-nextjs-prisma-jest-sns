import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '@/features/comment/comment.service';
import { PrismaService } from '@/core/database/prisma.service';
import { Comment } from '@prisma/client';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { jest } from '@jest/globals';

describe('CommentService', () => {
  let service: CommentService;
  let prismaService: PrismaService;

  const mockComment: Comment = {
    id: 1,
    content: 'Test comment',
    userId: 1,
    micropostId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: PrismaService,
          useValue: {
            comment: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const commentData = {
        content: 'Test comment',
        user: { connect: { id: 1 } },
        micropost: { connect: { id: 1 } },
      };

      jest.spyOn(prismaService.comment, 'create').mockResolvedValue(mockComment);

      const result = await service.create(commentData);

      expect(result).toEqual(mockComment);
      expect(prismaService.comment.create).toHaveBeenCalledWith({
        data: commentData,
      });
    });
  });

  describe('findAll', () => {
    it('should return all comments for a micropost', async () => {
      const micropostId = 1;
      const mockComments = [
        {
          ...mockComment,
          user: { id: 1, name: 'Test User' },
        },
      ];

      jest.spyOn(prismaService.comment, 'findMany').mockResolvedValue(mockComments);

      const result = await service.findAll(micropostId);

      expect(result).toEqual(mockComments);
      expect(prismaService.comment.findMany).toHaveBeenCalledWith({
        where: { micropostId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no comments found', async () => {
      const micropostId = 999;
      jest.spyOn(prismaService.comment, 'findMany').mockResolvedValue([]);

      const result = await service.findAll(micropostId);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const updateData = { content: 'Updated comment' };
    const userId = 1;

    it('should update a comment when user is the owner', async () => {
      jest.spyOn(prismaService.comment, 'findUnique').mockResolvedValue(mockComment);
      jest.spyOn(prismaService.comment, 'update').mockResolvedValue({
        ...mockComment,
        content: 'Updated comment',
      });

      const result = await service.update(mockComment.id, updateData, userId);

      expect(result.content).toBe('Updated comment');
      expect(prismaService.comment.update).toHaveBeenCalledWith({
        where: { id: mockComment.id },
        data: updateData,
      });
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      jest.spyOn(prismaService.comment, 'findUnique').mockResolvedValue(null);

      await expect(service.update(999, updateData, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      jest.spyOn(prismaService.comment, 'findUnique').mockResolvedValue(mockComment);

      await expect(service.update(mockComment.id, updateData, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    const userId = 1;

    it('should delete a comment when user is the owner', async () => {
      jest.spyOn(prismaService.comment, 'findUnique').mockResolvedValue(mockComment);
      jest.spyOn(prismaService.comment, 'delete').mockResolvedValue(mockComment);

      const result = await service.remove(mockComment.id, userId);

      expect(result).toEqual(mockComment);
      expect(prismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: mockComment.id },
      });
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      jest.spyOn(prismaService.comment, 'findUnique').mockResolvedValue(null);

      await expect(service.remove(999, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      jest.spyOn(prismaService.comment, 'findUnique').mockResolvedValue(mockComment);

      await expect(service.remove(mockComment.id, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
