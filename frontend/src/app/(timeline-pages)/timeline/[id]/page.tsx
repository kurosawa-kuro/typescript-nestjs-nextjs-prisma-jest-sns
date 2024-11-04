import React from 'react';
import { getMicropostDetails } from '@/app/actions/micropost';
import { notFound } from 'next/navigation';
import MicropostDetails from '@/components/Micropost/MicropostDetails';
import CategoryList from '@/components/Micropost/CategoryList';
import { getCategories } from '@/app/actions/category';
import TimelineLayout from '@/components/Micropost/TimelineLayout';

interface MicropostDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function MicropostDetailsPage({ params }: MicropostDetailsPageProps) {
  const micropostId = parseInt(params.id, 10);
  
  if (isNaN(micropostId)) {
    notFound();
  }

  const micropost = await getMicropostDetails(micropostId);
  const categories = await getCategories();

  if (!micropost) {
    notFound();
  }

  return (
    <TimelineLayout
      mainContent={<MicropostDetails micropost={micropost} />}
      categoryList={<CategoryList categories={categories} />}
    />
  );
}
