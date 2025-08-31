import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/button';

export default function BookingTestPage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log('✅ BookingTestPage mounted with React Router (working version)');
  }, []);

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          🎯 Test Page - React Router Working
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">Navigation hoạt động với React Router</p>
          
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg"
            onClick={() => {
              console.log('React Router Button clicked, navigating back...');
              navigate('/');
            }}
          >
            ← Quay về trang chủ
          </Button>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-medium mb-2">
              ✅ React Router đã hoạt động:
            </p>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Navigation từ Quick Actions OK</li>
              <li>• Component render thành công</li>
              <li>• Không lỗi useLocation() nữa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
