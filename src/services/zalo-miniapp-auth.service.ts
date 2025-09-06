import { 
  getUserID, 
  getAccessToken, 
  authorize, 
  getUserInfo,
  getPhoneNumber
} from 'zmp-sdk/apis';

// Zalo Mini App Authentication Service - PROPER IMPLEMENTATION  
// Following: https://miniapp.zaloplatforms.com/documents/intro/authen-user/

export class ZaloMiniAppAuthService {
  
  /**
   * 1. Get Zalo User ID
   * https://miniapp.zaloplatforms.com/documents/api/getUserID/
   */
  static async getUserID(): Promise<string> {
    try {
      const userID = await getUserID({});
      console.log('✅ Zalo getUserID success:', userID);
      return userID;
    } catch (error) {
      console.error('❌ getUserID failed:', error);
      throw new Error(`getUserID failed: ${error}`);
    }
  }

  /**
   * 2. Get Access Token for API calls
   * https://miniapp.zaloplatforms.com/documents/api/getAccessToken/
   */
  static async getAccessToken(): Promise<string> {
    try {
      const accessToken = await getAccessToken({});
      console.log('✅ Zalo getAccessToken success');
      return accessToken;
    } catch (error) {
      console.error('❌ getAccessToken failed:', error);
      throw new Error(`getAccessToken failed: ${error}`);
    }
  }

  /**
   * 3. Complete Authentication Flow
   * Combination of all above APIs
   */
  static async authenticateUser(): Promise<{
    userID: string;
    userInfo: any;
    accessToken: string;
    phoneData?: any;
  }> {
    try {
      console.log('🚀 Starting Zalo Mini App authentication flow...');

      // Step 1: Get User ID
      const userID = await this.getUserID();

      // Step 2: Get access token
      const accessToken = await this.getAccessToken();

      // Step 3: Authorize and get user info
      await authorize({ scopes: ['scope.userInfo'] });
      const userInfo = await getUserInfo({});

      console.log('✅ Zalo authentication completed:', {
        userID,
        userName: userInfo.name || 'Unknown',
        hasToken: !!accessToken
      });

      return {
        userID,
        userInfo,
        accessToken
      };
    } catch (error) {
      console.error('❌ Zalo authentication failed:', error);
      throw error;
    }
  }

  /**
   * 4. Check if running in Zalo environment
   */
  static isZaloEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           (window as any).ZaloJavaScriptInterface !== undefined;
  }

  /**
   * 5. Development fallback when not in Zalo
   */
  static getMockUserData(): {
    userID: string;
    userInfo: any;
    accessToken: string;
  } {
    return {
      userID: 'user-dev-123',
      userInfo: {
        id: 'user-dev-123',
        name: 'Development User',
        avatar: 'https://via.placeholder.com/100x100.png?text=Dev'
      },
      accessToken: 'dev-access-token-123'
    };
  }
}

export default ZaloMiniAppAuthService;

  /**
   * 6. Complete Authentication Flow
   * Combination of all above APIs
   */
  static async authenticateUser(): Promise<{
    userID: string;
    userInfo: ZaloUserInfo;
    accessToken: string;
    phoneData?: ZaloUserPhone;
  }> {
    try {
      console.log('🚀 Starting Zalo Mini App authentication flow...');

      // Step 1: Get User ID
      const userID = await this.getUserID();

      // Step 2: Authorize access to user info
      await this.authorize(['scope.userInfo']);

      // Step 3: Get access token
      const accessToken = await this.getAccessToken();

      // Step 4: Get user info
      const userInfo = await this.getUserInfo();

      // Step 5: Try to get phone number (optional)
      let phoneData: ZaloUserPhone | undefined;
      try {
        await this.authorize(['scope.userPhonenumber']); 
        phoneData = await this.getPhoneNumber();
      } catch (phoneError) {
        console.warn('⚠️ Phone number access not granted:', phoneError);
      }

      const result = {
        userID,
        userInfo,
        accessToken,
        phoneData
      };

      console.log('✅ Zalo authentication completed:', {
        userID,
        userName: userInfo.name,
        hasPhone: !!phoneData,
        hasToken: !!accessToken
      });

      return result;
    } catch (error) {
      console.error('❌ Zalo authentication failed:', error);
      throw error;
    }
  }

  /**
   * 7. Decode Phone Number Server-Side
   * https://miniapp.zaloplatforms.com/documents/api/getPhoneNumber/#token-to-phone
   */
  static async decodePhoneNumber(token: string): Promise<string | null> {
    try {
      const response = await fetch('https://graph.zalo.me/v2.0/me/info', {
        method: 'GET',
        headers: {
          'access_token': token
        }
      });

      const data = await response.json();
      
      if (data.error === 0 && data.data && data.data.number) {
        return data.data.number;
      }
      
      console.warn('⚠️ Could not decode phone number:', data);
      return null;
    } catch (error) {
      console.error('❌ Error decoding phone number:', error);
      return null;
    }
  }

  /**
   * 8. Get User Info from Zalo Graph API
   * https://developers.zalo.me/docs/api/social-api/tai-lieu/thong-tin-nguoi-dung-post-28
   */
  static async getUserInfoFromAPI(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://graph.zalo.me/v2.0/me', {
        method: 'GET',
        headers: {
          'access_token': accessToken
        }
      });

      const data = await response.json();
      
      if (data.error === 0) {
        return data.data;
      }
      
      throw new Error(`API Error: ${data.error} - ${data.message}`);
    } catch (error) {
      console.error('❌ Error getting user info from API:', error);
      throw error;
    }
  }

  /**
   * 9. Check if running in Zalo environment
   */
  static isZaloEnvironment(): boolean {
    // Check if zmp-sdk is available and we're in Zalo app
    return typeof api !== 'undefined' && 
           typeof window !== 'undefined' && 
           (window as any).ZaloJavaScriptInterface !== undefined;
  }

  /**
   * 10. Development fallback when not in Zalo
   */
  static getMockUserData(): {
    userID: string;
    userInfo: ZaloUserInfo;
    accessToken: string;
  } {
    return {
      userID: 'user-dev-123',
      userInfo: {
        id: 'user-dev-123',
        name: 'Development User',
        avatar: 'https://via.placeholder.com/100x100.png?text=Dev'
      },
      accessToken: 'dev-access-token-123'
    };
  }
}

export default ZaloMiniAppAuthService;
