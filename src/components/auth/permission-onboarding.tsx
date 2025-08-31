import React, { useState } from 'react';
import { Button, Box, Text, Page } from 'zmp-ui';
import { authorize } from 'zmp-sdk';
import toast from 'react-hot-toast';

interface PermissionOnboardingProps {
  onPermissionGranted: () => void;
}

export const PermissionOnboarding: React.FC<PermissionOnboardingProps> = ({ 
  onPermissionGranted 
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      console.log('🔐 Requesting user info permission...');
      
      const permissions = await authorize({
        scopes: ['scope.userInfo']
      });

      console.log('📋 Permission result:', permissions);

      if (permissions['scope.userInfo']) {
        toast.success('Cấp quyền thành công!');
        onPermissionGranted();
      } else {
        toast.error('Cần cấp quyền để sử dụng ứng dụng');
      }
    } catch (error: any) {
      console.error('❌ Permission error:', error);
      
      if (error?.code === -201) {
        toast.error('Vui lòng cho phép truy cập thông tin để sử dụng ứng dụng');
      } else {
        toast.error('Lỗi xin quyền. Vui lòng thử lại');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Page className="permission-onboarding">
      <Box className="p-6 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🏥</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Chào mừng đến với KajoTai
          </h1>
          <p className="text-gray-600">
            Phòng khám vật lý trị liệu chuyên nghiệp
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            📝 Tại sao cần quyền truy cập thông tin?
          </h2>
          <div className="text-left text-blue-700 space-y-2">
            <p>• <strong>Đặt lịch khám:</strong> Lưu thông tin lịch hẹn của bạn</p>
            <p>• <strong>Quản lý hồ sơ:</strong> Theo dõi lịch sử khám bệnh</p>
            <p>• <strong>Thông báo:</strong> Nhắc nhở lịch hẹn và kết quả khám</p>
            <p>• <strong>Mã QR:</strong> Tạo mã check-in tại phòng khám</p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="text-md font-semibold text-green-800 mb-2">
            🔒 Cam kết bảo mật
          </h3>
          <p className="text-green-700 text-sm">
            Thông tin của bạn được bảo vệ theo tiêu chuẩn y tế và 
            chỉ sử dụng cho mục đích khám chữa bệnh.
          </p>
        </div>

        <Button
          onClick={handleRequestPermission}
          loading={isRequesting}
          disabled={isRequesting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          {isRequesting ? 'Đang xử lý...' : '✅ Đồng ý và tiếp tục'}
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          Bằng cách tiếp tục, bạn đồng ý cho phép KajoTai truy cập 
          thông tin cơ bản của Zalo để sử dụng dịch vụ.
        </p>
      </Box>
    </Page>
  );
};
