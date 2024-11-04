'use server';

import { Micropost, MostViewRanking, Comment, CategoryRanking } from '@/types/micropost'; 
import { ApiClient } from '@/services/apiClient';
import { handleRequest } from './utils/handleRequest';

export async function getMicroposts(searchQuery?: string, sortBy?: string): Promise<Micropost[]> {
  return handleRequest(
    () => ApiClient.get<Micropost[]>('/microposts', {
      params: { 
        search: searchQuery,
        sortBy: sortBy 
      },
    }),
    'Error fetching microposts',
    []
  );
}

export async function getMicropostDetails(id: number): Promise<Micropost | null> {
  return handleRequest(
    () => ApiClient.get<Micropost>(`/microposts/${id}`),
    `Error fetching micropost details for id ${id}`,
    null
  );
}

export async function getMicropostComments(micropostId: number): Promise<Comment[]> {
  return handleRequest(
    () => ApiClient.get<Comment[]>(`/microposts/${micropostId}/comments`),
    `Error fetching comments for micropost ${micropostId}`,
    []
  );
}

export async function getMicropostRanking(): Promise<Micropost[]> {
  return handleRequest(
    () => ApiClient.get<Micropost[]>('/admin/ranking'),
    'Error fetching micropost ranking',
    []
  );
}

export async function getCategoryRanking(): Promise<CategoryRanking[]> {
  return handleRequest(
    () => ApiClient.get<CategoryRanking[]>('/admin/ranking/category'),
    'Error fetching category ranking',
    []
  );
}

export async function getMostViewRanking(): Promise<MostViewRanking[]> {
  return handleRequest(
    () => ApiClient.get<MostViewRanking[]>('/admin/ranking/most-view'),
    'Error fetching most view ranking',
    []
  );
}

export async function getUserMicroposts(userId: number): Promise<Micropost[]> {
  return handleRequest(
    () => ApiClient.get<Micropost[]>(`/microposts/user/${userId}`),
    `Error fetching microposts for user ${userId}`,
    []
  );
}
