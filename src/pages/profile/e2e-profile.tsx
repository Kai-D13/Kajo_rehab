import React from 'react';
import { ZaloService } from '../../services/zalo.service';
import { BookingService } from '../../services/booking.service';

interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [userBookings, setUserBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'info' | 'bookings' | 'settings'>('info');

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Get user information
      const user = await ZaloService.getUserInfo();
      setUserInfo(user);

      // Get user bookings
      if (user?.id) {
        const bookingsResult = await BookingService.getUserBookings(user.id);
        if (bookingsResult.success && bookingsResult.data) {
          setUserBookings(bookingsResult.data);
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadUserData();
    await ZaloService.showToast('Đã cập nhật thông tin', 'success');
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await ZaloService.showLoading('Đang hủy lịch...');
      const result = await BookingService.cancelBooking(bookingId);
      
      if (result.success) {
        await ZaloService.showToast('Hủy lịch thành công', 'success');
        loadUserData(); // Reload data
      } else {
        await ZaloService.showToast(result.error || 'Hủy lịch thất bại', 'error');
      }
    } catch (error) {
      console.error('Cancel booking failed:', error);
      await ZaloService.showToast('Có lỗi xảy ra', 'error');
    } finally {
      await ZaloService.hideLoading();
    }
  };

  const handleShareApp = async () => {
    try {
      await ZaloService.shareContent({
        title: 'KajoTai Rehab Clinic',
        description: 'Ứng dụng đặt lịch khám và chăm sóc sức khỏe',
        thumbnail: 'https://via.placeholder.com/300x300?text=KajoTai',
        path: '/'
      });
    } catch (error) {
      console.error('Share failed:', error);
      await ZaloService.showToast('Không thể chia sẻ', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Hồ sơ cá nhân
          </h1>
          <button
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-700"
          >
            🔄
          </button>
        </div>
      </div>

      {/* User Profile Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-6">
          <div className="flex items-center space-x-4">
            {userInfo?.avatar && (
              <img
                src={userInfo.avatar}
                alt="Avatar"
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {userInfo?.name || 'Khách hàng'}
              </h2>
              <p className="text-sm text-gray-600">
                ID: {userInfo?.id || 'N/A'}
              </p>
              <p className="text-sm text-blue-600">
                Thành viên KajoTai
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="px-4">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Thông tin
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Lịch hẹn ({userBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Cài đặt
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">
                Thông tin cá nhân
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên:</span>
                  <span className="font-medium">{userInfo?.name || 'Chưa có'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-medium text-xs">{userInfo?.id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng lịch hẹn:</span>
                  <span className="font-medium">{userBookings.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">
                Thống kê
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userBookings.filter(b => b.booking_status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Đã hoàn thành</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userBookings.filter(b => b.booking_status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-gray-600">Đã xác nhận</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {userBookings.length > 0 ? (
              userBookings.map((booking, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.appointment_date} - {booking.appointment_time}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.symptoms || 'Không có ghi chú'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        booking.booking_status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.booking_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.booking_status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.booking_status === 'confirmed' && 'Đã xác nhận'}
                      {booking.booking_status === 'pending' && 'Chờ xác nhận'}
                      {booking.booking_status === 'cancelled' && 'Đã hủy'}
                      {booking.booking_status === 'completed' && 'Hoàn thành'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      booking.checkin_status === 'checked_in'
                        ? 'bg-blue-100 text-blue-800'
                        : booking.checkin_status === 'arrived'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {booking.checkin_status === 'not_arrived' && 'Chưa đến'}
                      {booking.checkin_status === 'arrived' && 'Đã đến'}
                      {booking.checkin_status === 'checked_in' && 'Đã check-in'}
                      {booking.checkin_status === 'completed' && 'Hoàn tất'}
                    </span>
                    
                    {booking.booking_status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-red-600 text-sm hover:text-red-700"
                      >
                        Hủy lịch
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-600 mb-4">Chưa có lịch hẹn nào</p>
                <button
                  onClick={() => window.location.href = '/booking'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Đặt lịch ngay
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <button
                onClick={handleShareApp}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600">📤</span>
                  <span>Chia sẻ ứng dụng</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              
              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">🔔</span>
                    <span>Thông báo</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">
                Thông tin ứng dụng
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>🏥 KajoTai Rehab Clinic</p>
                <p>📱 Zalo Mini App</p>
                <p>🔧 Version: 1.0.0 (E2E Testing)</p>
                <p>👤 Test User: Hoàng Vũ</p>
              </div>
            </div>

            {/* E2E Testing Controls */}
            <div className="bg-gray-100 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3">
                🧪 E2E Testing Controls
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => ZaloService.runTestSuite()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
                >
                  Run Zalo Service Tests
                </button>
                <button
                  onClick={() => BookingService.runTestSuite()}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700"
                >
                  Run Booking Service Tests
                </button>
                <button
                  onClick={loadUserData}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded text-sm hover:bg-gray-700"
                >
                  Refresh User Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
