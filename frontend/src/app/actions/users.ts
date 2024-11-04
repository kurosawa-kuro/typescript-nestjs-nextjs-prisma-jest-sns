'use server';

import { UserDetails } from '@/types/user';
import { ApiClient } from '@/services/apiClient';
import { handleRequest } from './utils/handleRequest';

export async function getUsers(): Promise<UserDetails[]> {
  return handleRequest(
    () => ApiClient.get<UserDetails[]>('/users'),
    'Error fetching users',
    []
  );
}

export async function getUsersWithFollowStatus(): Promise<UserDetails[]> {
  return handleRequest(
    () => ApiClient.get<UserDetails[]>('/users/with-follow-status'),
    'Error fetching users with follow status',
    []
  );
}

export async function getUserDetails(id: number): Promise<UserDetails | null> {
  return handleRequest(
    () => ApiClient.get<UserDetails>(`/users/${id}`),
    `Error fetching user details for id ${id}`,
    null
  );
}

export async function followUser(userId: number): Promise<UserDetails[]> {
  return handleRequest(
    () => ApiClient.post<UserDetails[]>(`/users/${userId}/follow`, {}),
    `Error following user ${userId}`
  );
}

export async function unfollowUser(userId: number): Promise<UserDetails[]> {
  return handleRequest(
    () => ApiClient.delete<UserDetails[]>(`/users/${userId}/follow`),
    `Error unfollowing user ${userId}`
  );
}

export async function getFollowers(userId: number): Promise<UserDetails[]> {
  return handleRequest(
    () => ApiClient.get<UserDetails[]>(`/users/${userId}/followers`),
    `Error fetching followers for user ${userId}`,
    []
  );
}

export async function getFollowing(userId: number): Promise<UserDetails[]> {
  return handleRequest(
    () => ApiClient.get<UserDetails[]>(`/users/${userId}/following`),
    `Error fetching following users for user ${userId}`,
    []
  );
}

export async function getMe(): Promise<UserDetails | null> {
  return handleRequest(
    () => ApiClient.get<UserDetails>('/auth/me'),
    'Error fetching current user',
    null
  );
}
