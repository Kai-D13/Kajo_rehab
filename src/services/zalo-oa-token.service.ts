// Zalo OA Token Management Service
// Tự động lấy và refresh access token cho Official Account
// Theo tài liệu: https://developers.zalo.me/docs/official-account/bat-dau/xac-thuc-va-uy-quyen-cho-ung-dung-new

interface ZaloOATokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface ZaloOAConfig {
  app_id: string;
  app_secret: string;
  oa_id: string;
}

class ZaloOATokenService {
  private static instance: ZaloOATokenService;
  private config: ZaloOAConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private constructor() {
    this.config = {
      app_id: import.meta.env.VITE_ZALO_APP_ID || '2403652688841115720',
      app_secret: import.meta.env.VITE_ZALO_APP_SECRET || '1Yb5YMVFGwGB7J7mSR9C',
      oa_id: import.meta.env.VITE_ZALO_OA_ID || '2339827548685253412'
    };
  }

  static getInstance(): ZaloOATokenService {
    if (!ZaloOATokenService.instance) {
      ZaloOATokenService.instance = new ZaloOATokenService();
    }
    return ZaloOATokenService.instance;
  }

  /**
   * Step 1: Get authorization URL để user authorize OA
   * User cần access URL này để grant permission cho app
   */
  getAuthorizationUrl(): string {
    const baseUrl = 'https://oauth.zaloapp.com/v4/oa/permission';
    const params = new URLSearchParams({
      app_id: this.config.app_id,
      redirect_uri: import.meta.env.VITE_ZALO_REDIRECT_URI || `https://zmp.zalo.me/app/${this.config.app_id}`,
      state: 'oauth_state_' + Date.now(), // CSRF protection
      oa_id: this.config.oa_id
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Step 2: Exchange authorization code for access token
   * Gọi sau khi user authorize và redirect về với code
   */
  async exchangeCodeForToken(code: string): Promise<ZaloOATokenResponse> {
    try {
      console.log('🔄 Exchanging authorization code for OA token...');
      
      const response = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': this.config.app_secret
        },
        body: new URLSearchParams({
          app_id: this.config.app_id,
          grant_type: 'authorization_code',
          code: code
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Zalo OA Token Error: ${data.error} - ${data.error_description}`);
      }

      // Store tokens
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

      console.log('✅ OA Access token obtained successfully');
      console.log('⏰ Token expires at:', new Date(this.tokenExpiresAt).toISOString());

      // Store trong localStorage để persist
      this.storeTokens(data);

      return data;

    } catch (error) {
      console.error('❌ Failed to exchange code for OA token:', error);
      throw error;
    }
  }

  /**
   * Step 3: Refresh access token khi expired
   */
  async refreshAccessToken(): Promise<ZaloOATokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available. Need to re-authorize.');
    }

    try {
      console.log('🔄 Refreshing OA access token...');

      const response = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': this.config.app_secret
        },
        body: new URLSearchParams({
          app_id: this.config.app_id,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Token refresh failed: ${data.error} - ${data.error_description}`);
      }

      // Update tokens
      this.accessToken = data.access_token;
      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
      }
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

      console.log('✅ OA Access token refreshed successfully');
      
      // Store updated tokens
      this.storeTokens(data);

      return data;

    } catch (error) {
      console.error('❌ Failed to refresh OA token:', error);
      throw error;
    }
  }

  /**
   * Get valid access token (auto refresh if needed)
   */
  async getValidAccessToken(): Promise<string> {
    // Load from storage if not in memory
    if (!this.accessToken) {
      this.loadTokensFromStorage();
    }

    // Check if token exists and is not expired
    if (this.accessToken && this.tokenExpiresAt > Date.now() + 60000) { // 1 minute buffer
      return this.accessToken;
    }

    // Try to refresh if we have refresh token
    if (this.refreshToken) {
      try {
        const tokens = await this.refreshAccessToken();
        return tokens.access_token;
      } catch (error) {
        console.warn('Failed to refresh token, need re-authorization:', error);
        throw new Error('Token expired and refresh failed. Need re-authorization.');
      }
    }

    throw new Error('No valid OA access token. Need authorization first.');
  }

  /**
   * Check if we have valid tokens
   */
  isAuthorized(): boolean {
    this.loadTokensFromStorage();
    return !!(this.accessToken && this.tokenExpiresAt > Date.now());
  }

  /**
   * Store tokens trong localStorage
   */
  private storeTokens(tokens: ZaloOATokenResponse): void {
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: this.tokenExpiresAt,
      oa_id: this.config.oa_id
    };

    localStorage.setItem('zalo_oa_tokens', JSON.stringify(tokenData));
  }

  /**
   * Load tokens từ localStorage
   */
  private loadTokensFromStorage(): void {
    try {
      const stored = localStorage.getItem('zalo_oa_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        if (tokens.oa_id === this.config.oa_id) { // Ensure same OA
          this.accessToken = tokens.access_token;
          this.refreshToken = tokens.refresh_token;
          this.tokenExpiresAt = tokens.expires_at;
        }
      }
    } catch (error) {
      console.warn('Failed to load stored OA tokens:', error);
    }
  }

  /**
   * Clear stored tokens (logout)
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = 0;
    localStorage.removeItem('zalo_oa_tokens');
  }

  /**
   * Get OA info để verify token
   */
  async getOAInfo(): Promise<any> {
    try {
      const accessToken = await this.getValidAccessToken();
      
      const response = await fetch('https://openapi.zalo.me/v3.0/oa/getoa', {
        method: 'GET',
        headers: {
          'access_token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.error !== 0) {
        throw new Error(`Get OA info failed: ${data.message}`);
      }

      return data.data;

    } catch (error) {
      console.error('❌ Failed to get OA info:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const zaloOATokenService = ZaloOATokenService.getInstance();
export default zaloOATokenService;
