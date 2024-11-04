import { Micropost, NewMicropost, Comment, Category } from '@/types/micropost';
import { LoginResponse, UserDetails, Role } from '../types/user';
import { ApiClient } from './apiClient';

export const ClientSideApiService = {
  login: (email: string, password: string) => 
    ApiClient.post<LoginResponse>('/auth/login', { email, password }),

  logout: () => ApiClient.post('/auth/logout', {}),

  me: (token?: string) => ApiClient.get<UserDetails>('/auth/me'),

  updateAvatar: (userId: number, formData: FormData) => 
    ApiClient.put<UserDetails>(`/users/${userId}/avatar`, formData, {
      rawBody: true,
    }),

  updateUserProfile: (userId: number, updatedFields: Partial<UserDetails>) => 
    ApiClient.put<UserDetails>(`/users/${userId}`, updatedFields),

  followUser: async (userId: number) => {
    const response = await ApiClient.post(`/follow/${userId}`, {});
    return response;
  },

  unfollowUser: async (userId: number) => {
    const response = await ApiClient.delete(`/follow/${userId}`);
    return response;
  },

  createMicroPost: (formData: FormData) => 
    ApiClient.post<NewMicropost>('/microposts', formData, {
      rawBody: true,
    }),

  createComment: (micropostId: number, content: string) =>
    ApiClient.post(`/microposts/${micropostId}/comments`, { content }),

  getComments: (micropostId: number) =>
    ApiClient.get(`/microposts/${micropostId}/comments`),

  addLike: (micropostId: number) => 
    ApiClient.post(`/microposts/${micropostId}/likes`, {}),

  removeLike: (micropostId: number) => 
    ApiClient.delete(`/microposts/${micropostId}/likes`),

  getLikeStatus: (micropostId: number) =>
    ApiClient.get(`/microposts/${micropostId}/likes`),

  getMicropostDetails: (micropostId: number) => 
    ApiClient.get(`/microposts/${micropostId}`),

  addMicropostView: async (micropostId: number) => {
    try {
      const response = await ApiClient.post(`/micropost-views/${micropostId}`, {});
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('P2002')) {
        return { success: true, message: 'View already recorded' };
      }
      throw error;
    }
  },

  getCategories: () => ApiClient.get<Category[]>('/categories'),

  createCategory: (name: string) => 
    ApiClient.post<Category>('/categories', { name }),

  getAvailableRoles: () => {
    console.log('getAvailableRoles');
    return ApiClient.get<Role[]>('/users/available-roles');
  },

  getUserDetails: (userId: number) =>
    ApiClient.get<UserDetails>(`/users/${userId}`),

  updateUserRoles: (userId: number, roles: string[], action: 'add' | 'remove') =>
    ApiClient.put<UserDetails>(`/users/${userId}/roles`, { roles, action }),

  getUserRoles: (userId: number) =>
    ApiClient.get<string[]>(`/users/${userId}/roles`),

  exportUsers: async () => {
    const blob = await ApiClient.get<Blob>('/users/export-csv', {
      responseType: 'blob'
    });
    
    // ダウンロードリンクを作成
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `users_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
