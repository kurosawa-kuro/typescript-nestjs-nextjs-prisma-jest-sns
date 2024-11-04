import { Test, TestingModule } from '@nestjs/testing';
import { DevelopController } from '@/features/develop/develop.controller';
import { DevelopService } from '@/features/develop/develop.service';

describe('DevelopController', () => {
  let controller: DevelopController;
  let service: DevelopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevelopController],
      providers: [
        {
          provide: DevelopService,
          useValue: {
            resetDb: jest.fn().mockResolvedValue({ message: 'Database reset successful' }),
          },
        },
      ],
    }).compile();

    controller = module.get<DevelopController>(DevelopController);
    service = module.get<DevelopService>(DevelopService);
  });

  describe('resetDb', () => {
    it('should call resetDb method of DevelopService', async () => {
      const result = await controller.resetDb();
      expect(service.resetDb).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Database reset successful' });
    });
  });

  describe('demoUserLogin', () => {
    it('should return a message', async () => {
      const result = await controller.demoUserLogin();
      expect(result).toEqual({ message: 'demo_user_login.' });
    });
  });
});
