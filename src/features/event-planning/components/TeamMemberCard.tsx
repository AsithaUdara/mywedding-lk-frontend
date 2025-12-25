// File: src/features/event-planning/components/TeamMemberCard.tsx

import React from 'react';
import { Organizer } from '@/lib/api/events';
import { Shield, Edit3, Eye } from 'lucide-react';

const TeamMemberCard = ({ organizer }: { organizer: Organizer }) => {
  const getInitials = (firstName: string, lastName: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 1).toUpperCase();
    }
    return 'U';
  };

  const getPermissionIcon = (level: string) => {
    switch (level) {
      case 'Owner':
        return <Shield size={14} className="text-yellow-500" />;
      case 'Editor':
        return <Edit3 size={14} className="text-blue-500" />;
      case 'Viewer':
        return <Eye size={14} className="text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-cream/50 rounded-lg border border-gray-200">
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
        {getInitials(organizer.firstName, organizer.lastName)}
      </div>
      <div className="flex-grow overflow-hidden">
        <p className="font-semibold text-charcoal truncate">
          {organizer.firstName} {organizer.lastName}
        </p>
        <p className="text-xs text-gray-500 truncate">{organizer.email}</p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-1.5" title={organizer.permissionLevel}>
        {getPermissionIcon(organizer.permissionLevel)}
        <span className="text-xs font-medium text-gray-600 hidden sm:inline">{organizer.permissionLevel}</span>
      </div>
    </div>
  );
};

export default TeamMemberCard;
