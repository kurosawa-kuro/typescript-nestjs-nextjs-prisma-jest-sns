'use client';

import React, { useState, useEffect } from 'react';
import MicropostCard from '@/components/Micropost/MicropostCard';
import Link from 'next/link';
import { TimelineProps } from '@/types/micropost';
import CreateMicroPostModal from './CreateMicroPostModal';
import { useAuthStore } from '@/store/authStore';
import { useSearchParams } from 'next/navigation';

const Timeline: React.FC<TimelineProps> = ({ microposts, currentPage, totalPages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  
  const currentSearchQuery = searchParams.get('search') || '';
  const currentSortBy = searchParams.get('sortBy') || '';

  useEffect(() => {
    setSearchQuery(currentSearchQuery);
    setSortBy(currentSortBy);
  }, [currentSearchQuery, currentSortBy]);

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy) params.set('sortBy', sortBy);
    if (page > 1) params.set('page', page.toString());
    return `?${params.toString()}`;
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.location.href = `/timeline?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full sm:w-auto"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Latest</option>
            <option value="likes">Most Liked</option>
            <option value="mostView">Most Viewed</option>
          </select>
          <Link
            href={getPageUrl(1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Apply
          </Link>
        </div>
        {user && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 w-full sm:w-auto"
          >
            Create Post
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {microposts.map((micropost) => (
          <MicropostCard key={micropost.id} micropost={micropost} />
        ))}
      </div>
      
      <div className="flex justify-center">
        <nav className="inline-flex rounded-md shadow">
          {currentPage > 1 && (
            <Link 
              href={getPageUrl(currentPage - 1)} 
              className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={`px-4 py-2 bg-white border border-gray-300 text-sm font-medium ${
                currentPage === page ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link 
              href={getPageUrl(currentPage + 1)} 
              className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </nav>
      </div>

      <CreateMicroPostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Timeline;
