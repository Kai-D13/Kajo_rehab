// Production Environment Detection & Configuration
export class EnvironmentService {
  static isDevelopment(): boolean {
    return import.meta.env.DEV || 
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }

  static isProduction(): boolean {
    return !this.isDevelopment();
  }

  static isZaloEnvironment(): boolean {
    // Check if running inside Zalo Mini App
    return window.location.hostname.includes('zalo') || 
           window.location.protocol === 'zaui:' ||
           navigator.userAgent.includes('ZaloPC') ||
           navigator.userAgent.includes('Zalo');
  }

  static getAppMode(): 'development' | 'production-web' | 'production-zalo' {
    if (this.isDevelopment()) {
      return 'development';
    }
    
    if (this.isZaloEnvironment()) {
      return 'production-zalo';
    }
    
    return 'production-web';
  }

  static shouldUseMockData(): boolean {
    const mode = this.getAppMode();
    // In production Zalo environment, use mock data to avoid auth conflicts
    return mode === 'development' || mode === 'production-zalo';
  }

  static shouldUseSupabase(): boolean {
    const mode = this.getAppMode();
    // Only use Supabase in web production mode
    return mode === 'production-web';
  }

  static logEnvironment(): void {
    const mode = this.getAppMode();
    const useMock = this.shouldUseMockData();
    const useSupabase = this.shouldUseSupabase();
    
    console.log('🏗️ Environment Configuration:', {
      mode,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent.substring(0, 100),
      useMockData: useMock,
      useSupabase: useSupabase
    });
  }
}

// Log environment on load
EnvironmentService.logEnvironment();
