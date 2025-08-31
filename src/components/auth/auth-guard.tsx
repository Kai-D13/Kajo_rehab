import React, { useState, useEffect } from 'react';
import { Box, Spinner, Text } from 'zmp-ui';
import { AuthService } from '@/services/auth.service';
import { PermissionOnboarding } from '@/components/auth/permission-onboarding';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setIsLoading(true);
      
      // Check if already authenticated
      if (AuthService.isAuthenticated()) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Try to authenticate
      await AuthService.authenticateUser();
      setIsAuthenticated(true);
      
    } catch (error: any) {
      console.error('❌ Auth check failed:', error);
      
      // If permission related error, show onboarding
      if (error?.message?.includes('quyền') || error?.code === -1401 || error?.code === -201) {
        setNeedsPermission(true);
      } else {
        toast.error('Lỗi đăng nhập: ' + (error?.message || 'Vui lòng thử lại'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionGranted = async () => {
    try {
      setIsLoading(true);
      setNeedsPermission(false);
      
      // Try authentication again after permission granted
      await AuthService.authenticateUser();
      setIsAuthenticated(true);
      toast.success('Đăng nhập thành công!');
      
    } catch (error: any) {
      console.error('❌ Auth after permission failed:', error);
      toast.error('Vẫn không thể đăng nhập. Vui lòng thử lại');
      setNeedsPermission(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-6xl mb-4">🏥</div>
        <Spinner />
        <Text className="mt-4 text-gray-600">
          Đang khởi tạo KajoTai...
        </Text>
      </Box>
    );
  }

  // Need permission state
  if (needsPermission) {
    return <PermissionOnboarding onPermissionGranted={handlePermissionGranted} />;
  }

  // Authenticated state
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback - should not reach here
  return (
    <Box className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-6xl mb-4">❌</div>
      <Text className="text-red-600 text-center">
        Không thể đăng nhập. Vui lòng thử lại.
      </Text>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        🔄 Thử lại
      </button>
    </Box>
  );
};
