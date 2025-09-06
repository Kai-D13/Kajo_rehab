// Zalo User Management Service
// Xử lý User ID mapping giữa Mini App và OA theo tài liệu Zalo
import { getUserInfo } from 'zmp-sdk/apis';

export interface ZaloUserInfo {
  id: string;
  name: string;
  avatar: string;
}

export class ZaloUserService {
  private static userCache: Map<string, ZaloUserInfo> = new Map();

  /**
   * Lấy User ID từ Zalo Mini App để gửi OA message
   * Theo doc: getUserInfo API để lấy User ID của người dùng
   */
  static async getCurrentUserId(): Promise<string | null> {
    try {
      console.log('📱 Getting current user ID from Zalo Mini App...');
      
      const userInfo = await getUserInfo({
        avatarType: 'normal'
      });

      if (userInfo.userInfo && userInfo.userInfo.id) {
        const userId = userInfo.userInfo.id;
        
        // Cache user info for future use
        this.userCache.set(userId, {
          id: userId,
          name: userInfo.userInfo.name || '',
          avatar: userInfo.userInfo.avatar || ''
        });

        console.log('✅ User ID retrieved:', userId);
        return userId;
      }

      console.error('❌ No user ID found in response');
      return null;
      
    } catch (error) {
      console.error('❌ Failed to get user ID:', error);
      return null;
    }
  }

  /**
   * Lấy thông tin user đầy đủ
   */
  static async getCurrentUserInfo(): Promise<ZaloUserInfo | null> {
    try {
      const userInfo = await getUserInfo({
        avatarType: 'normal'
      });

      if (userInfo.userInfo) {
        const user: ZaloUserInfo = {
          id: userInfo.userInfo.id,
          name: userInfo.userInfo.name || '',
          avatar: userInfo.userInfo.avatar || ''
        };

        this.userCache.set(user.id, user);
        return user;
      }

      return null;
      
    } catch (error) {
      console.error('❌ Failed to get user info:', error);
      return null;
    }
  }

  /**
   * Lấy user info từ cache
   */
  static getCachedUserInfo(userId: string): ZaloUserInfo | null {
    return this.userCache.get(userId) || null;
  }

  /**
   * Kiểm tra user có follow OA chưa
   * Note: Cần implement qua backend API check
   */
  static async checkUserFollowOA(userId: string): Promise<boolean> {
    try {
      // Gọi backend API để check follow status
      const response = await fetch('/api/check-follow-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      const result = await response.json();
      return result.is_following || false;
      
    } catch (error) {
      console.error('❌ Failed to check follow status:', error);
      return false;
    }
  }

  /**
   * Lưu User ID vào database khi booking
   * Theo doc: "Lưu trữ User ID vào hệ thống backend"
   */
  static async saveUserIdToBooking(bookingId: string, userId: string): Promise<boolean> {
    try {
      console.log(`💾 Saving User ID ${userId} to booking ${bookingId}`);
      
      // Import dynamic để tránh circular dependency
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { error } = await supabase
        .from('bookings')
        .update({ user_id: userId })
        .eq('id', bookingId);

      if (error) {
        console.error('❌ Failed to save user ID:', error);
        return false;
      }

      console.log('✅ User ID saved to booking');
      return true;
      
    } catch (error) {
      console.error('❌ Error saving user ID:', error);
      return false;
    }
  }

  /**
   * Clear cache khi logout
   */
  static clearCache(): void {
    this.userCache.clear();
    console.log('🧹 User cache cleared');
  }
}

export default ZaloUserService;
