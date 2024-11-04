import { Comment } from '@/types/micropost';
import { UserInfo } from '@/types/user';
import CommentList from './CommentList';
import CreateCommentModal from './CreateCommentModal';

interface CommentsSectionProps {
  comments: Comment[];
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  micropostId: number;
  onCommentCreated: () => Promise<void>;
  user: UserInfo | null;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  isModalOpen,
  onOpenModal,
  onCloseModal,
  micropostId,
  onCommentCreated,
  user
}) => (
  <div className="w-[400px] bg-white rounded-lg shadow-lg p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold">
        Comments ({comments.length})
      </h2>
      {user && (
        <button
          onClick={onOpenModal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Comment
        </button>
      )}
    </div>
    <div className="h-[calc(100vh-250px)] overflow-y-auto">
      <CommentList comments={comments} />
    </div>

    <CreateCommentModal
      isOpen={isModalOpen}
      onClose={onCloseModal}
      micropostId={micropostId}
      onCommentCreated={onCommentCreated}
    />
  </div>
);

export default CommentsSection; 