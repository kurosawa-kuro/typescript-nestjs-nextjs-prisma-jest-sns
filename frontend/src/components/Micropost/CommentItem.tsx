import React from 'react';
import { Comment } from '@/types/micropost';

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <p className="mb-2">{comment.content}</p>
      <div className="flex items-center text-sm text-gray-600">
        <img
          src={comment.user.profile?.avatarPath 
            ? `http://localhost:3001/uploads/${comment.user.profile.avatarPath}`
            : `http://localhost:3001/uploads/default_avatar.png`}
          alt={`${comment.user.name}'s avatar`}
          className="w-8 h-8 rounded-full mr-2"
        />
        <span>{comment.user.name}</span>
        <span className="mx-2">•</span>
        <span>{new Date(comment.createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default CommentItem;
