import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface LikeButtonProps {
  isLiked: boolean;
  count: number;
  onClick: () => void;
  disabled: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({ isLiked, count, onClick, disabled }) => (
  <button 
    onClick={onClick}
    className="flex items-center text-gray-500 text-sm"
    disabled={disabled}
  >
    {isLiked ? (
      <FaHeart className="mr-1 text-red-500" />
    ) : (
      <FaRegHeart className="mr-1" />
    )}
    <span>{count}</span>
  </button>
);

export default LikeButton; 