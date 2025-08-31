import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SimpleBookingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  
  console.log('📍 BookingSuccess loaded with appointmentId:', appointmentId);

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pt-8">
        {/* Success Message */}
        <div className="text-center bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✅</span>
          </div>
          <h1 className="text-xl font-bold text-green-800 mb-2">
            Đặt lịch thành công!
          </h1>
          <p className="text-green-600 text-sm">
            Lịch hẹn đã được tự động xác nhận
          </p>
          <p className="text-gray-600 text-xs mt-2">
            ID: {appointmentId}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => navigate('/schedule')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
          >
            Xem lịch hẹn của tôi
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300"
          >
            Về trang chủ
          </button>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
          <p className="text-yellow-700 text-sm">
            ✅ Booking success page loaded<br/>
            📧 Appointment ID: {appointmentId}<br/>
            🔄 Status: Auto-confirmed<br/>
            📱 QR will be available in schedule
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleBookingSuccess;
