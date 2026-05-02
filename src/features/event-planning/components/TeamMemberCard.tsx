import React from 'react';
import { type Organizer } from '@/lib/api/events';
import { Shield, Edit3, Eye, ChevronDown, Loader2 } from 'lucide-react';

interface TeamMemberCardProps {
  organizer: Organizer;
  isOwner?: boolean;
  onUpdateRole?: (userId: string, targetType: 'permissionLevel', newValue: string) => void;
  isUpdating?: boolean;
}

const TeamMemberCard = ({ organizer, isOwner, onUpdateRole, isUpdating }: TeamMemberCardProps) => {
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
    const normalized = level === 'Edit' ? 'Editor' : level === 'View' ? 'Viewer' : level;
    switch (normalized) {
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

  const displayPermission = (level: string) => {
    if (level === 'Edit') return 'Editor';
    if (level === 'View') return 'Viewer';
    return level;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-cream/50 rounded-lg border border-gray-200">
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
        {getInitials(organizer.firstName, organizer.lastName)}
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-charcoal truncate">
          {organizer.firstName} {organizer.lastName} {organizer.permissionLevel === 'Owner' && <span className="text-xs text-yellow-600 font-bold ml-1">(Owner)</span>}
        </p>
        <p className="text-xs text-gray-500 truncate">{organizer.email}</p>
      </div>

      {isOwner && organizer.permissionLevel !== 'Owner' ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          {isUpdating ? (
            <Loader2 size={16} className="animate-spin text-primary mr-2" />
          ) : (
            <div className="relative">
              <select
                value={organizer.permissionLevel}
                onChange={(e) => onUpdateRole?.(organizer.userId, 'permissionLevel', e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-xs px-2 py-1 pr-6 rounded focus:outline-none focus:border-primary"
              >
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-shrink-0 flex items-center gap-1.5" title={displayPermission(organizer.permissionLevel)}>
          {getPermissionIcon(organizer.permissionLevel)}
          <span className="text-xs font-medium text-gray-600 hidden sm:inline">
            {organizer.permissionLevel === 'Owner' ? 'Owner' : displayPermission(organizer.permissionLevel)}
          </span>
        </div>
      )}
    </div>
  );
};

export default TeamMemberCard;
