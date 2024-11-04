import '@testing-library/jest-dom';

import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../src/middleware';
import { ClientSideApiService } from '../src/services/ClientSideApiService';

jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn().mockImplementation((url) => ({ 
      type: 'redirect', 
      url,
      cookies: {
        delete: jest.fn(),
      },
    })),
    next: jest.fn().mockImplementation((config) => ({ 
      type: 'next',
      request: {
        headers: new Headers(),
      },
      ...config 
    })),
  },
}));

jest.mock('../src/services/ClientSideApiService', () => ({
  ClientSideApiService: {
    me: jest.fn(),
  },
}));

describe('Middleware', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      cookies: {
        get: jest.fn(),
      },
      nextUrl: {
        pathname: '',
      },
      url: 'http://localhost/',
      headers: new Headers(),
    } as unknown as NextRequest;
  });

  const setupRequest = (pathname: string, token?: string, userRoles?: string[]) => {
    mockRequest.nextUrl.pathname = pathname;
    mockRequest.cookies.get = jest.fn().mockReturnValue(token ? { value: token } : undefined);
    if (userRoles) {
      (ClientSideApiService.me as jest.Mock).mockResolvedValue({ userRoles });
    }
  };

  describe('Public routes', () => {
    test('skips processing for login page', async () => {
      setupRequest('/login');
      const result = await middleware(mockRequest);
      expect(result.type).toBe('next');
    });
  });

  describe('Protected routes', () => {
    test('redirects to login page when no token is present', async () => {
      setupRequest('/some-protected-route');
      await middleware(mockRequest);
      expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/login', mockRequest.url));
    });

    test('does not redirect when token is present and user data is valid', async () => {
      setupRequest('/some-protected-route', 'valid-token', ['user']);
      const result = await middleware(mockRequest);
      expect(result.type).toBe('next');
    });
  });

  describe('Admin routes', () => {
    test('redirects to home when non-admin user tries to access admin route', async () => {
      setupRequest('/admin/some-route', 'valid-token', ['user']);
      const result = await middleware(mockRequest);
      expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/', mockRequest.url));
      expect(result.type).toBe('redirect');
    });

    test('allows admin user to access admin route', async () => {
      setupRequest('/admin/some-route', 'valid-token', ['admin']);
      const result = await middleware(mockRequest);
      expect(result.type).toBe('next');
    });
  });

  describe('Error handling', () => {
    test('redirects to login and deletes jwt cookie when API call fails', async () => {
      setupRequest('/some-protected-route', 'valid-token');
      (ClientSideApiService.me as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      const result = await middleware(mockRequest);
      const expectedUrl = new URL('/login', mockRequest.url);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(expectedUrl);
      expect(result.cookies.delete).toHaveBeenCalledWith('jwt');
      expect(result.type).toBe('redirect');
    });
  });
});
