import { Test, TestingModule } from '@nestjs/testing';
import { BaseService } from '@/core/common/base.service';
import { PrismaService } from '@/core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

// テスト用のモックエンティティ
interface MockEntity {
  id: number;
  name: string;
}

// BaseServiceを継承したテスト用のサービスクラス
class TestService extends BaseService<
  MockEntity,
  Omit<MockEntity, 'id'>,
  Partial<MockEntity>,
  { id: number },
  Partial<MockEntity>
> {
  protected entityName = 'TestEntity';

  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

  protected getRepository() {
    return this.prisma['testEntity'];
  }
}

// Update the PrismaMock type
type PrismaMock = {
  [key: string]: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findFirst: jest.Mock;
  };
};

describe('BaseService', () => {
  let service: TestService;
  let prismaService: PrismaMock;

  const mockEntity: MockEntity = {
    id: 1,
    name: 'Test Entity',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: {
            testEntity: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findFirst: jest.fn(),
            },
          } as PrismaMock,
        },
        {
          provide: TestService,
          useFactory: (prisma: PrismaService) => new TestService(prisma),
          inject: [PrismaService],
        },
      ],
    }).compile();

    service = module.get<TestService>(TestService);
    prismaService = module.get<PrismaService>(PrismaService) as unknown as PrismaMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an entity', async () => {
      const createDto = { name: 'New Entity' };
      (prismaService.testEntity.create as jest.Mock).mockResolvedValue(mockEntity);

      const result = await service.create(createDto);

      expect(result).toEqual(mockEntity);
      expect(prismaService.testEntity.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  describe('all', () => {
    it('should return all entities', async () => {
      (prismaService.testEntity.findMany as jest.Mock).mockResolvedValue([mockEntity]);

      const result = await service.all();

      expect(result).toEqual([mockEntity]);
      expect(prismaService.testEntity.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find an entity by id', async () => {
      (prismaService.testEntity.findUnique as jest.Mock).mockResolvedValue(mockEntity);

      const result = await service.findById(1);

      expect(result).toEqual(mockEntity);
      expect(prismaService.testEntity.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if entity not found', async () => {
      (prismaService.testEntity.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      const updateDto = { name: 'Updated Entity' };
      (prismaService.testEntity.update as jest.Mock).mockResolvedValue({ ...mockEntity, ...updateDto });

      const result = await service.update(1, updateDto);

      expect(result).toEqual({ ...mockEntity, ...updateDto });
      expect(prismaService.testEntity.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if entity not found for update', async () => {
      (prismaService.testEntity.update as jest.Mock).mockRejectedValue({ code: 'P2025' });

      await expect(service.update(1, { name: 'Updated Entity' })).rejects.toThrow(NotFoundException);
    });

    it('should throw original error if not P2025', async () => {
      const originalError = new Error('Database connection failed');
      (prismaService.testEntity.update as jest.Mock).mockRejectedValue(originalError);

      await expect(service.update(1, { name: 'Updated Entity' })).rejects.toThrow('Database connection failed');
    });
  });

  describe('destroy', () => {
    it('should delete an entity', async () => {
      (prismaService.testEntity.delete as jest.Mock).mockResolvedValue(mockEntity);

      await service.destroy(1);

      expect(prismaService.testEntity.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if entity not found for deletion', async () => {
      (prismaService.testEntity.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });

      await expect(service.destroy(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw original error if not P2025', async () => {
      const originalError = new Error('Database connection failed');
      (prismaService.testEntity.delete as jest.Mock).mockRejectedValue(originalError);

      await expect(service.destroy(1)).rejects.toThrow('Database connection failed');
    });
  });

  describe('findFirst', () => {
    it('should find first entity matching criteria', async () => {
      const where = { name: 'Test Entity' };
      (prismaService.testEntity.findFirst as jest.Mock).mockResolvedValue(mockEntity);

      const result = await service.findFirst(where);

      expect(result).toEqual(mockEntity);
      expect(prismaService.testEntity.findFirst).toHaveBeenCalledWith({ where });
    });

    it('should throw NotFoundException if no entity found', async () => {
      const where = { name: 'Non-existent Entity' };
      (prismaService.testEntity.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.findFirst(where)).rejects.toThrow(NotFoundException);
    });
  });
});
