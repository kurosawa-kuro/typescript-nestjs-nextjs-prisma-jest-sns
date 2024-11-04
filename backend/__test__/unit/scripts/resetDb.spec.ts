import { Test } from '@nestjs/testing';
import { DevelopService } from '../../../src/features/develop/develop.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../src/app.module';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    createApplicationContext: jest.fn(),
  },
}));

describe('resetDb Script', () => {
  let mockApp: any;
  let mockDevelopService: jest.Mocked<DevelopService>;
  const mockClose = jest.fn();
  const mockGet = jest.fn();
  const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    mockDevelopService = {
      resetDb: jest.fn().mockResolvedValue({ message: 'Database has been reset.' }),
    } as any;

    mockApp = {
      close: mockClose,
      get: mockGet.mockReturnValue(mockDevelopService),
    };

    (NestFactory.createApplicationContext as jest.Mock).mockResolvedValue(mockApp);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully reset the database', async () => {
    // Import the script to execute it
    await import('../../../src/scripts/resetDb');

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    expect(NestFactory.createApplicationContext).toHaveBeenCalledWith(AppModule);
    expect(mockGet).toHaveBeenCalledWith(DevelopService);
    expect(mockDevelopService.resetDb).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalledWith('Resetting database...');
    expect(mockConsoleLog).toHaveBeenCalledWith('Database reset completed successfully.');
    expect(mockProcessExit).toHaveBeenCalledWith(0);
  });
});
