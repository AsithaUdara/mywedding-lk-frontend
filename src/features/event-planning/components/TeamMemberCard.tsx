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
    <div className="flex items-center gap-4 p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200 group">
      <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full font-bold shadow-sm ${organizer.permissionLevel === 'Owner' ? 'bg-[#daa520]/10 text-[#b8860b] border border-[#daa520]/20' : 'bg-primary/5 text-primary border border-primary/10'}`}>
        {getInitials(organizer.firstName, organizer.lastName)}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-sm font-bold text-charcoal truncate flex items-center gap-2">
          {organizer.firstName} {organizer.lastName} 
          {organizer.permissionLevel === 'Owner' && <span className="text-[9px] uppercase tracking-widest text-[#b8860b] bg-[#daa520]/10 px-2 py-0.5 rounded-full font-bold">Owner</span>}
        </p>
        <p className="text-xs text-gray-400 font-medium truncate mt-0.5">{organizer.email}</p>
      </div>

      {isOwner && organizer.permissionLevel !== 'Owner' ? (
        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {isUpdating ? (
            <Loader2 size={16} className="animate-spin text-primary mr-2" />
          ) : (
            <div className="relative">
              <select
                value={organizer.permissionLevel}
                onChange={(e) => onUpdateRole?.(organizer.userId, 'permissionLevel', e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-600 px-3 py-1.5 pr-8 rounded-lg focus:outline-none focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-50" title={displayPermission(organizer.permissionLevel)}>
          {getPermissionIcon(organizer.permissionLevel)}
        </div>
      )}
    </div>
  );
};

export default TeamMemberCard;
