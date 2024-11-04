export interface TokenService {
    getServerSideToken(): string | undefined;
    getClientSideToken(): string | undefined;
  }
  
  export class DefaultTokenService implements TokenService {
    getServerSideToken(): string | undefined {
      const { cookies } = require('next/headers');
      return cookies().get('jwt')?.value;
    }
  
    getClientSideToken(): string | undefined {
      const jwt = document.cookie.split('; ').find(row => row.startsWith('jwt='));
      return jwt ? jwt.split('=')[1] : undefined;
    }
  }
  
  export class TokenServiceFactory {
    private static instance: TokenService = new DefaultTokenService();
  
    static getInstance(): TokenService {
      return this.instance;
    }
  
    static setInstance(service: TokenService) {
      this.instance = service;
    }
  }