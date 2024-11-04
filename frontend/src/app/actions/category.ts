'use server';

import { Category, CategoryDetail } from '@/types/micropost';
import { ApiClient } from '@/services/apiClient';
import { handleRequest } from './utils/handleRequest';

export async function getCategories(): Promise<Category[]> {
  return handleRequest(
    () => ApiClient.get<Category[]>('/categories'),
    'Error fetching categories',
    []
  );
}

export async function getCategoryDetail(id: number): Promise<CategoryDetail | null> {
  return handleRequest(
    () => ApiClient.get<CategoryDetail>(`/categories/${id}`),
    `Error fetching category detail for id ${id}`,
    null
  );
}
