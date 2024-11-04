import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-500" />
    </div>
  );
};

export default LoadingSpinner;
