import React from 'react';
import { Comment } from '@/types/micropost';
import CommentItem from '@/components/Micropost/CommentItem';

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <>
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </>
  );
};

export default CommentList;
