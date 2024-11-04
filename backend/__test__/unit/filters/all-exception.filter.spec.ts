import { AllExceptionFilter } from '@/core/filters/all-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

describe('AllExceptionFilter', () => {
  let filter: AllExceptionFilter;
  let httpAdapterHost: HttpAdapterHost;
  let mockHttpAdapter: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    mockHttpAdapter = {
      reply: jest.fn(),
      getRequestUrl: jest.fn(),
    };

    httpAdapterHost = {
      httpAdapter: mockHttpAdapter,
    } as any;

    filter = new AllExceptionFilter(httpAdapterHost);

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
        getResponse: jest.fn(),
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and return appropriate response', () => {
    const mockException = new HttpException('Test exception', HttpStatus.BAD_REQUEST);
    const mockDate = new Date('2023-01-01T00:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    mockHttpAdapter.getRequestUrl.mockReturnValue('/test-url');

    filter.catch(mockException, mockArgumentsHost);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      undefined,
      {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: mockDate.toISOString(),
        path: '/test-url',
        message: 'Test exception',
        errorResponse: 'Test exception',
      },
      HttpStatus.BAD_REQUEST
    );
  });

  it('should catch unknown exceptions and return 500 Internal Server Error', () => {
    const mockException = new Error('Unknown error');
    const mockDate = new Date('2023-01-01T00:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    mockHttpAdapter.getRequestUrl.mockReturnValue('/test-url');

    filter.catch(mockException, mockArgumentsHost);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      undefined,
      {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: mockDate.toISOString(),
        path: '/test-url',
        message: 'Error: Unknown error',
        errorResponse: 'Error: Unknown error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  });

  it('should handle exceptions with custom error response', () => {
    const mockException = new HttpException(
      { error: 'Custom error', message: 'Custom message' },
      HttpStatus.BAD_REQUEST
    );
    const mockDate = new Date('2023-01-01T00:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    mockHttpAdapter.getRequestUrl.mockReturnValue('/test-url');

    filter.catch(mockException, mockArgumentsHost);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      undefined,
      {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: mockDate.toISOString(),
        path: '/test-url',
        message: 'Custom error',
        errorResponse: { error: 'Custom error', message: 'Custom message' },
      },
      HttpStatus.BAD_REQUEST
    );
  });
});
