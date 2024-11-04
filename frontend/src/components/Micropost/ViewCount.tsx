import { FaEye } from 'react-icons/fa';

interface ViewCountProps {
  count: number;
}

const ViewCount: React.FC<ViewCountProps> = ({ count }) => (
  <div className="flex items-center text-gray-500 text-sm">
    <FaEye className="mr-1" />
    <span>{count}</span>
  </div>
);

export default ViewCount; 