import React from 'react';
import { Button } from 'zmp-ui';
import { AuthService } from '@/services/auth.service';
import toast from 'react-hot-toast';

interface LoginButtonProps {
  onLoginSuccess?: (user: any) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'highlight' | 'danger' | 'neutral';
  children?: React.ReactNode;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  onLoginSuccess,
  className = '',
  size = 'medium',
  type = 'highlight',
  children = 'Đăng nhập với Zalo'
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { user, zaloUser } = await AuthService.authenticateUser();
      
      toast.success(`Xin chào ${user.name}!`);
      onLoginSuccess?.({ user, zaloUser });
    } catch (error) {
      console.error('Login failed:', error);
      // Error toast được handle trong AuthService
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type={type}
      size={size}
      className={className}
      loading={loading}
      onClick={handleLogin}
    >
      {children}
    </Button>
  );
};
