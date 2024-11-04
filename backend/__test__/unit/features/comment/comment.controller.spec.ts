import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from '@/features/comment/comment.controller';
import { CommentService } from '@/features/comment/comment.service';
import { AuthGuard } from '@/features/auth/guards/auth.guard';
import { AuthService } from '@/features/auth/auth.service';
import { Reflector } from '@nestjs/core';

describe('CommentController', () => {
  let controller: CommentController;
  let service: CommentService;

  const mockComment = {
    id: 1,
    content: 'Test comment',
    userId: 1,
    micropostId: 1,
    createdAt: new Date('2024-10-29T10:30:42.540Z'),
    updatedAt: new Date('2024-10-29T10:30:42.540Z'),
  };

  const mockUser = { id: 1 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockComment),
            findAll: jest.fn().mockResolvedValue([mockComment]),
            update: jest.fn().mockResolvedValue(mockComment),
            remove: jest.fn().mockResolvedValue(mockComment),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateToken: jest.fn().mockResolvedValue(true),
          },
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get<CommentService>(CommentService);
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const commentData = { content: 'Test comment' };
      const micropostId = '1';

      const result = await controller.create(micropostId, commentData, mockUser);

      expect(result).toEqual(mockComment);
      expect(service.create).toHaveBeenCalledWith({
        content: commentData.content,
        micropost: { connect: { id: 1 } },
        user: { connect: { id: mockUser.id } },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of comments', async () => {
      const micropostId = '1';

      const result = await controller.findAll(micropostId);

      expect(result).toEqual([mockComment]);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const id = '1';
      const commentData = { content: 'Updated comment' };

      const result = await controller.update(id, commentData, mockUser);

      expect(result).toEqual(mockComment);
      expect(service.update).toHaveBeenCalledWith(1, commentData, mockUser.id);
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      const id = '1';

      const result = await controller.remove(id, mockUser);

      expect(result).toEqual(mockComment);
      expect(service.remove).toHaveBeenCalledWith(1, mockUser.id);
    });
  });
});
