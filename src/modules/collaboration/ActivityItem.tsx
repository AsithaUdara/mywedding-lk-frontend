import React from 'react';
import { type ActivityFeedItem } from '@/shared/lib/api/feed';
import { MessageSquare, CheckCircle, UserPlus, Wallet } from 'lucide-react';

const ActivityItem = ({ item }: { item: ActivityFeedItem }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'U';
  };

  const renderIcon = () => {
    if (item.itemType === 'UserComment') {
      return (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
          {getInitials(item.userFirstName, item.userLastName)}
        </div>
      );
    }
    // For SystemLog, we check the content for keywords
    if (item.content.includes('completed')) {
      return <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="text-green-600" /></div>;
    }
    if (item.content.includes('invited')) {
      return <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"><UserPlus className="text-purple-600" /></div>;
    }
    if (item.content.includes('expense')) {
      return <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><Wallet className="text-red-600" /></div>;
    }
    // Default system log icon
    return <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><MessageSquare className="text-gray-500" /></div>;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };

  return (
    <div className="flex items-start gap-4 group">
      <div className="relative">
        {renderIcon()}
        {/* Subtle connecting line for the feed effect (hidden on last item ideally, but handled simply here) */}
        <div className="absolute top-10 left-1/2 -ml-[1px] w-[2px] h-full bg-gray-100 group-last:hidden" />
      </div>
      <div className="flex-grow pt-1 pb-4">
        <p className="text-sm text-charcoal leading-snug">
          <span className="font-bold">{item.userFirstName} {item.userLastName}</span>
          {item.itemType === 'SystemLog' ? <span className="text-gray-600"> {item.content}</span> : <span className="text-gray-600">: {item.content}</span>}
        </p>
        <p className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 mt-1.5">{formatTimeAgo(item.createdAt)}</p>
      </div>
    </div>
  );
};

export default ActivityItem;

