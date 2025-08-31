import React from 'react';
import { Avatar, Text, Box } from 'zmp-ui';
import { AuthService } from '@/services/auth.service';

interface UserProfileProps {
  showName?: boolean;
  avatarSize?: number;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  showName = true,
  avatarSize = 40,
  className = ''
}) => {
  const user = AuthService.getCurrentUser();
  const zaloUser = AuthService.getCurrentZaloUser();

  if (!user || !zaloUser) {
    return null;
  }

  return (
    <Box className={`flex items-center space-x-2 ${className}`}>
      <Avatar
        story="default"
        size={avatarSize}
        src={user.avatar || zaloUser.avatar}
      />
      {showName && (
        <Text size="normal" className="font-medium">
          {user.name}
        </Text>
      )}
    </Box>
  );
};
