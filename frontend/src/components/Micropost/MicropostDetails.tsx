'use client';

import React, { useState, useEffect } from 'react';
import { Micropost, Comment } from '@/types/micropost';
import CommentList from '@/components/Micropost/CommentList';
import { FaHeart, FaRegHeart, FaEye, FaClock } from 'react-icons/fa';
import CreateCommentModal from '@/components/Micropost/CreateCommentModal';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import { ClientSideApiService } from '@/services/ClientSideApiService';
import UserAvatar from './UserAvatar';
import TimeStamp from './TimeStamp';
import ViewCount from './ViewCount';
import LikeButton from './LikeButton';
import MainContent from './MainContent';
import CommentsSection from './CommentsSection';

const MicropostDetails: React.FC<{ micropost: Micropost }> = ({ micropost }) => {
  const [state, setState] = useState({
    isCommentModalOpen: false,
    comments: micropost.comments,
    likesCount: micropost.likesCount,
    isLiked: micropost.isLiked || false,
    viewsCount: micropost.viewsCount || 0
  });
  const { user } = useAuthStore();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // コンポーネントを分割
  const MetaInfo = () => (
    <div className="flex items-center gap-4 mb-4">
      <UserAvatar user={micropost.user} />  
      <TimeStamp date={micropost.createdAt} />
      <ViewCount count={state.viewsCount} />
      <LikeButton 
        isLiked={state.isLiked}
        count={state.likesCount}
        onClick={handleLikeClick}
        disabled={!user}
      />
    </div>
  );

  const updateMicropostState = async () => {
    const updatedMicropost = await ClientSideApiService.getMicropostDetails(micropost.id) as Micropost;
    setState(prev => ({
      ...prev,
      viewsCount: updatedMicropost.viewsCount,
      likesCount: updatedMicropost.likesCount,
      isLiked: updatedMicropost.isLiked || false,
      comments: updatedMicropost.comments
    }));
  };

  useEffect(() => {
    const recordView = async () => {
      try {
        await ClientSideApiService.addMicropostView(micropost.id);
        await updateMicropostState();
      } catch (error) {
        if (error instanceof Error && error.message.includes('P2002')) return;
        console.error('Failed to record view:', error);
      }
    };

    recordView();
  }, [micropost.id]);

  const handleCommentCreated = async () => {
    if (!user) return;

    try {
      await updateMicropostState();
      setState(prev => ({ ...prev, isCommentModalOpen: false }));
    } catch (error) {
      console.error('Failed to refresh comments:', error);
    }
  };

  const handleLikeClick = async () => {
    if (!user) return;

    try {
      await (state.isLiked 
        ? ClientSideApiService.removeLike(micropost.id)
        : ClientSideApiService.addLike(micropost.id));
      await updateMicropostState();
    } catch (error) {
      console.error('Failed to handle like:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        <MainContent 
          micropost={micropost} 
          apiUrl={apiUrl}
          metaInfo={<MetaInfo />}
        />
        <CommentsSection
          comments={state.comments}
          isModalOpen={state.isCommentModalOpen}
          onOpenModal={() => setState(prev => ({ ...prev, isCommentModalOpen: true }))}
          onCloseModal={() => setState(prev => ({ ...prev, isCommentModalOpen: false }))}
          micropostId={micropost.id}
          onCommentCreated={handleCommentCreated}
          user={user}
        />
      </div>
    </div>
  );
};

export default MicropostDetails;
