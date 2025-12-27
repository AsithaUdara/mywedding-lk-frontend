// File: src/components/ui/LoadingSkeleton.tsx
import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

const LoadingSkeleton = ({ className = '' }: LoadingSkeletonProps) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

export default LoadingSkeleton;
