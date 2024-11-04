import React from 'react';
import { getMicroposts } from '../../actions/micropost';
import { getCategories } from '../../actions/category';
import Timeline from '@/components/Micropost/Timeline';
import CategoryList from '@/components/Micropost/CategoryList';
import TimelineLayout from '@/components/Micropost/TimelineLayout';

const POSTS_PER_PAGE = 4;

export default async function TimelinePage({ 
  searchParams 
}: { 
  searchParams: { 
    page?: string;
    search?: string;
    category?: string;
    sortBy?: string;
  } 
}) {
  const currentPage = Number(searchParams.page) || 1;
  const searchQuery = searchParams.search || '';
  const categoryId = searchParams.category;

  // 並行してデータを取得
  const [allMicroposts, categories] = await Promise.all([
    getMicroposts(searchQuery, searchParams.sortBy),
    getCategories()
  ]);
  
  // カテゴリーでフィルタリング（必要な場合）
  const filteredMicroposts = categoryId
    ? allMicroposts.filter(post => 
        post.categories?.some(cat => cat.id === Number(categoryId))
      )
    : allMicroposts;

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const microposts = filteredMicroposts.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(filteredMicroposts.length / POSTS_PER_PAGE);

  return (
    <TimelineLayout
      mainContent={
        <Timeline
          microposts={microposts}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      }
      categoryList={<CategoryList categories={categories} />}
    />
  );
}
