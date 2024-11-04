// User type without password
export interface UserWithoutPassword {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// UserInfo type
export interface UserInfo {
  id: number;
  name: string;
  email: string;
  userRoles: string[];
  profile?: { avatarPath?: string };
}

// LoginResponse type
export interface LoginResponse {
  token: string;
  user: UserInfo;
}

// AuthState interface
export interface AuthState {
  user: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  resetStore: () => void;
  login: (email: string, password: string) => Promise<LoginResponse | null>;
  logout: () => Promise<void>;
}

// ApiError interface
export interface ApiError extends Error {
  statusCode?: number;
}

// UserDetails interface (which is now equivalent to UserWithProfile)
export interface UserDetails {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  userRoles: string[];
  profile?: { avatarPath?: string };
  isFollowing?: boolean;
}

// LoginDto interface
export interface LoginDto {
  email: string;
  password: string;
}

// RegisterDto interface
export interface RegisterDto extends LoginDto {
  name: string;
}


export interface Role {
  id: number;
  name: string;
  description: string;
}
