import { Test, TestingModule } from '@nestjs/testing';
import { BaseController } from '@/core/common/base.controller';
import { NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';

// テスト用のモデル
interface TestModel {
  id: number;
  name: string;
}

// BaseControllerを継承したテスト用のコントローラー
class TestController extends BaseController<TestModel> {
  constructor(@Inject('SERVICE') service: any) {
    super(service);
  }
}

describe('BaseController', () => {
  let controller: TestController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      all: jest.fn(),
      findById: jest.fn(), // Changed from findOne to findById
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        {
          provide: 'SERVICE',
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TestController>(TestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    it('should return an array of items', async () => {
      const result: TestModel[] = [{ id: 1, name: 'Test' }];
      mockService.all.mockResolvedValue(result);

      expect(await controller.index()).toBe(result);
      expect(mockService.all).toHaveBeenCalled();
    });
  });

  describe('show', () => {
    it('should return a single item', async () => {
      const result: TestModel = { id: 1, name: 'Test' };
      mockService.findById.mockResolvedValue(result); // Changed from findOne to findById

      expect(await controller.show(1)).toBe(result);
      expect(mockService.findById).toHaveBeenCalledWith(1); // Changed from findOne to findById
    });

    it('should throw NotFoundException when item is not found', async () => {
      mockService.findById.mockResolvedValue(null); // Changed from findOne to findById

      await expect(controller.show(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new item', async () => {
      const newItem: TestModel = { id: 1, name: 'New Test' };
      mockService.create.mockResolvedValue(newItem);

      expect(await controller.create({ name: 'New Test' })).toBe(newItem);
      expect(mockService.create).toHaveBeenCalledWith({ name: 'New Test' });
    });
  });

  describe('update', () => {
    it('should update and return the updated item', async () => {
      const updatedItem: TestModel = { id: 1, name: 'Updated Test' };
      mockService.update.mockResolvedValue(updatedItem);

      expect(await controller.update(1, { name: 'Updated Test' })).toBe(updatedItem);
      expect(mockService.update).toHaveBeenCalledWith(1, { name: 'Updated Test' });
    });
  });

  describe('destroy', () => {
    it('should call the service method to delete an item', async () => {
      await controller.destroy(1);
      expect(mockService.destroy).toHaveBeenCalledWith(1);
    });
  });
});
