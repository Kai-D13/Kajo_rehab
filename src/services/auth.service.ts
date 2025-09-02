import { getAccessToken, getUserInfo, authorize, getUserID } from 'zmp-sdk';
import { User } from './supabase.config';
import { MockDatabaseService } from './mock-database.service';
import toast from 'react-hot-toast';

export interface ZaloUserInfo {
  id: string;
  name: string;
  avatar: string;
}

export class AuthService {
  private static currentUser: User | null = null;
  private static currentZaloUser: ZaloUserInfo | null = null;

  /**
   * Request permissions from user first
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      console.log('🔐 Requesting user permissions...');
      
      const permissions = await authorize({
        scopes: ['scope.userInfo', 'scope.userPhonenumber']
      });

      console.log('📋 Permission results:', permissions);

      if (!permissions['scope.userInfo']) {
        throw new Error('Cần cấp quyền truy cập thông tin để sử dụng ứng dụng');
      }

      // Check phone number permission (optional but recommended)
      if (!permissions['scope.userPhonenumber']) {
        console.warn('⚠️  Phone number permission not granted');
      }

      return true;
    } catch (error: any) {
      console.error('❌ Permission request failed:', error);
      
      if (error?.code === -201) {
        toast.error('Người dùng từ chối cấp quyền. Cần quyền truy cập để sử dụng ứng dụng.');
      } else {
        toast.error('Không thể xin quyền truy cập. Vui lòng thử lại.');
      }
      
      return false;
    }
  }

  /**
   * Authenticate user với Zalo và tạo/update user trong database
   */
  static async authenticateUser(): Promise<{ user: User; zaloUser: any }> {
    try {
      // Check if in development environment
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
      
      let zaloUser: any;
      let userInfo: ZaloUserInfo;

      if (isDevelopment) {
        // Mock user data for development - use consistent ID
        console.log('🔧 Development mode: Using mock user data');
        const mockUserId = 'user-dev-123'; // Consistent development user ID
        
        zaloUser = {
          userInfo: {
            id: mockUserId,
            name: 'Test User',
            avatar: '/static/doctors/default-avatar.png'
          }
        };
        
        userInfo = {
          id: mockUserId,
          name: 'Test User',
          avatar: 'https://via.placeholder.com/100x100.png?text=Dev'
        };
      } else {
        // Production: Request permissions first, then get user info
        console.log('🔑 Production mode: Getting user info from Zalo API...');
        
        try {
          // Step 1: Request permissions first
          const hasPermission = await this.requestPermissions();
          if (!hasPermission) {
            throw new Error('Cần cấp quyền truy cập để sử dụng ứng dụng');
          }

          // Step 2: Get user info with permission
          zaloUser = await getUserInfo({
            autoRequestPermission: true,
            avatarType: 'normal'
          });

          console.log('✅ Zalo getUserInfo success:', zaloUser);

          // Extract userInfo from Zalo response according to API spec
          if (!zaloUser || !zaloUser.userInfo) {
            throw new Error('Không nhận được thông tin người dùng từ Zalo');
          }

          const zaloUserInfo = zaloUser.userInfo;
          
          // Map according to Zalo API documentation
          userInfo = {
            id: zaloUserInfo.id || '',
            name: zaloUserInfo.name || 'Người dùng Zalo',
            avatar: zaloUserInfo.avatar || ''
          };

          if (!userInfo.id) {
            throw new Error('Không thể lấy ID người dùng từ Zalo');
          }

          console.log('✅ Extracted user info:', userInfo);

        } catch (zaloError: any) {
          console.error('❌ Zalo getUserInfo error:', zaloError);
          
          // Handle specific Zalo API errors
          if (zaloError?.code === -1401) {
            throw new Error('Người dùng từ chối cung cấp thông tin. Vui lòng cho phép truy cập để sử dụng ứng dụng.');
          } else if (zaloError?.code === -1402) {
            throw new Error('Không thể kết nối đến Zalo. Vui lòng kiểm tra kết nối mạng.');
          } else {
            throw new Error('Lỗi xác thực Zalo: ' + (zaloError?.message || 'Vui lòng thử lại'));
          }
        }
      }

      // Kiểm tra hoặc tạo user trong database
      const user = await this.findOrCreateUser(userInfo);
      
      this.currentUser = user;
      this.currentZaloUser = userInfo;

      console.log('✅ Authentication successful for user:', userInfo.id);
      return { user, zaloUser };
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('từ chối')) {
          toast.error('Cần cấp quyền truy cập thông tin để sử dụng ứng dụng');
        } else if (error.message.includes('kết nối')) {
          toast.error('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại!');
      }
      throw error;
    }
  }

  /**
   * Tìm hoặc tạo user trong database
   */
  private static async findOrCreateUser(zaloUser: ZaloUserInfo): Promise<User> {
    // Always use mock database to avoid auth conflicts in production
    console.log('🔧 Using mock database for user management (production safe)');
    return await MockDatabaseService.findOrCreateUser(zaloUser.id, zaloUser);
  }

  /**
   * Lấy Zalo Access Token
   */
  static async getZaloAccessToken(): Promise<string> {
    try {
      const response = await getAccessToken();
      return response;
    } catch (error) {
      console.error('Error getting Zalo access token:', error);
      throw new Error('Không thể lấy Zalo access token');
    }
  }

  /**
   * Lấy current user
   */
  static getCurrentUser(): User | null {
    // Auto-initialize user in development mode if not already set
    if (!this.currentUser && (import.meta.env.DEV || window.location.hostname === 'localhost')) {
      console.log('🔧 Auto-creating development user...');
      this.currentUser = {
        id: 'user-dev-123',
        zalo_id: 'user-dev-123',
        name: 'Test User (Dev)',
        phone: '+84123456789',
        avatar: '/static/doctors/default-avatar.png',
        email: 'dev@test.com',
        created_at: new Date().toISOString()
      };
      
      // Also set Zalo user
      this.currentZaloUser = {
        id: 'user-dev-123',
        name: 'Test User (Dev)',
        avatar: '/static/doctors/default-avatar.png'
      };
      
      console.log('✅ Development user auto-created:', this.currentUser.id);
    }
    return this.currentUser;
  }

  /**
   * Set current user (for testing)
   */
  static setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  /**
   * Lấy current Zalo user
   */
  static getCurrentZaloUser(): ZaloUserInfo | null {
    return this.currentZaloUser;
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  static isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentZaloUser !== null;
  }

  /**
   * Logout user
   */
  static logout(): void {
    this.currentUser = null;
    this.currentZaloUser = null;
  }

  /**
   * Refresh user information
   */
  static async refreshUser(): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    try {
      await this.authenticateUser();
    } catch (error) {
      console.error('Error refreshing user:', error);
      this.logout();
      throw error;
    }
  }
}
