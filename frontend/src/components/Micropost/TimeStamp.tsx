import { FaClock } from 'react-icons/fa';

interface TimeStampProps {
  date: string | Date;
}

const TimeStamp: React.FC<TimeStampProps> = ({ date }) => (
  <div className="flex items-center text-gray-500 text-sm">
    <FaClock className="mr-1" />
    <span>{new Date(date).toLocaleDateString()}</span>
  </div>
);

export default TimeStamp; 