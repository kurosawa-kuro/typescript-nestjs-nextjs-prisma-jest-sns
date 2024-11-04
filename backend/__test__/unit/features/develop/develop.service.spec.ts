import { Test, TestingModule } from '@nestjs/testing';
import { DevelopService } from '@/features/develop/develop.service';
import { PrismaService } from '@/core/database/prisma.service';
import { seed } from '../../../../prisma/seed';

// seedをモック化
jest.mock('../../../../prisma/seed', () => ({
  seed: jest.fn(),
}));

describe('DevelopService', () => {
  let service: DevelopService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevelopService,
        {
          provide: PrismaService,
          useValue: {
            // PrismaServiceのモックは必要最小限に
            $disconnect: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DevelopService>(DevelopService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resetDb', () => {
    it('should seed the database', async () => {
      // Arrange
      (seed as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await service.resetDb();

      // Assert
      expect(seed).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Database has been reset.' });
    });

    it('should throw an error if seeding fails', async () => {
      // Arrange
      const error = new Error('Seeding failed');
      (seed as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.resetDb()).rejects.toThrow('Seeding failed');
    });
  });
});
