import { DefaultTokenService, TokenServiceFactory, TokenService } from '../../../src/services/auth/tokenService';

// next/headers のモック
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn()
  })
}));

describe('TokenService', () => {
  describe('DefaultTokenService', () => {
    let tokenService: DefaultTokenService;

    beforeEach(() => {
      tokenService = new DefaultTokenService();
      // document.cookie をリセット
      Object.defineProperty(window.document, 'cookie', {
        writable: true,
        value: '',
      });
      // next/headers のモックをリセット
      jest.clearAllMocks();
    });

    describe('getServerSideToken', () => {
      it('should return token when jwt cookie exists', () => {
        const { cookies } = require('next/headers');
        cookies().get.mockReturnValue({ value: 'test-jwt-token' });

        const result = tokenService.getServerSideToken();
        
        expect(result).toBe('test-jwt-token');
        expect(cookies().get).toHaveBeenCalledWith('jwt');
      });

      it('should return undefined when jwt cookie does not exist', () => {
        const { cookies } = require('next/headers');
        cookies().get.mockReturnValue(undefined);

        const result = tokenService.getServerSideToken();
        
        expect(result).toBeUndefined();
        expect(cookies().get).toHaveBeenCalledWith('jwt');
      });
    });

    describe('getClientSideToken', () => {
      it('should return token when jwt cookie exists', () => {
        document.cookie = 'jwt=test-client-token; path=/';

        const result = tokenService.getClientSideToken();
        
        expect(result).toBe('test-client-token');
      });

      it('should return undefined when jwt cookie does not exist', () => {
        document.cookie = 'other=value; path=/';

        const result = tokenService.getClientSideToken();
        
        expect(result).toBeUndefined();
      });

      it('should handle multiple cookies correctly', () => {
        document.cookie = 'other=value; jwt=test-client-token; another=value';

        const result = tokenService.getClientSideToken();
        
        expect(result).toBe('test-client-token');
      });

      it('should return undefined when cookies string is empty', () => {
        document.cookie = '';

        const result = tokenService.getClientSideToken();
        
        expect(result).toBeUndefined();
      });
    });
  });

  describe('TokenServiceFactory', () => {
    beforeEach(() => {
      // ファクトリーをリセット
      TokenServiceFactory.setInstance(new DefaultTokenService());
    });

    it('should return default instance initially', () => {
      const instance = TokenServiceFactory.getInstance();
      expect(instance).toBeInstanceOf(DefaultTokenService);
    });

    it('should allow setting and getting custom instance', () => {
      const mockTokenService: TokenService = {
        getServerSideToken: jest.fn().mockReturnValue('mock-server-token'),
        getClientSideToken: jest.fn().mockReturnValue('mock-client-token'),
      };

      TokenServiceFactory.setInstance(mockTokenService);
      const instance = TokenServiceFactory.getInstance();

      expect(instance).toBe(mockTokenService);
      expect(instance.getServerSideToken()).toBe('mock-server-token');
      expect(instance.getClientSideToken()).toBe('mock-client-token');
    });

    it('should maintain singleton pattern', () => {
      const instance1 = TokenServiceFactory.getInstance();
      const instance2 = TokenServiceFactory.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
