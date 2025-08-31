import React, { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { LoginButton } from './LoginButton';
import { Spinner, Box, Text } from 'zmp-ui';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireAuth = true
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          setIsAuthenticated(true);
        } else if (requireAuth) {
          // Try to auto-authenticate
          await AuthService.authenticateUser();
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth]);

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Spinner visible />
      </Box>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <Box className="flex flex-col items-center justify-center min-h-screen p-4">
        <Text.Title className="mb-4 text-center">
          Chào mừng đến với KajoTai
        </Text.Title>
        <Text className="mb-8 text-center text-gray-600">
          Vui lòng đăng nhập để sử dụng ứng dụng
        </Text>
        <LoginButton 
          onLoginSuccess={() => setIsAuthenticated(true)}
        />
      </Box>
    );
  }

  return <>{children}</>;
};
