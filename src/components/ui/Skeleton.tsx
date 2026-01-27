import React from 'react';

const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className ?? ''}`} />
  );
};

export default Skeleton;
