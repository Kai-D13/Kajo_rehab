import api from "zmp-sdk";

export class ZaloNavigationService {
  /**
   * Navigate to another Mini App
   */
  static async navigateToMiniApp(appId: string, path: string = "", params: any = {}) {
    try {
      await api.navigateToMiniApp({
        appId,
        path,
        params
      });
    } catch (error) {
      console.error("Error navigating to mini app:", error);
    }
  }

  /**
   * Open Zalo Official Account
   */
  static async openOfficialAccount(oaId: string) {
    try {
      await api.openChat({
        type: "oa",
        id: oaId
      });
    } catch (error) {
      console.error("Error opening OA:", error);
    }
  }

  /**
   * Request phone number with better UX
   */
  static async requestPhoneNumber(): Promise<string | null> {
    try {
      const result = await api.getPhoneNumber();
      return result.number;
    } catch (error) {
      console.error("Error getting phone number:", error);
      return null;
    }
  }

  /**
   * Show follow OA widget
   */
  static async showFollowOAWidget(oaId: string) {
    try {
      await api.showFunctionButtonWidget({
        type: "follow",
        oaId: oaId
      });
    } catch (error) {
      console.error("Error showing follow widget:", error);
    }
  }

  /**
   * Cache data using native storage
   */
  static async setNativeStorage(key: string, data: any) {
    try {
      await api.setStorage({
        data: {
          [key]: JSON.stringify(data)
        }
      });
    } catch (error) {
      console.error("Error setting native storage:", error);
    }
  }

  /**
   * Get cached data from native storage
   */
  static async getNativeStorage(keys: string[]): Promise<any> {
    try {
      const result = await api.getStorage({
        keys
      });
      const data: any = {};
      for (const key of keys) {
        if (result[key]) {
          try {
            data[key] = JSON.parse(result[key]);
          } catch {
            data[key] = result[key];
          }
        }
      }
      return data;
    } catch (error) {
      console.error("Error getting native storage:", error);
      return {};
    }
  }

  /**
   * Remove data from native storage
   */
  static async removeNativeStorage(keys: string[]) {
    try {
      await api.removeStorage({
        keys
      });
    } catch (error) {
      console.error("Error removing native storage:", error);
    }
  }

  /**
   * Share content via Zalo
   */
  static async shareContent(content: {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    path?: string;
  }) {
    try {
      await api.share({
        type: "link",
        data: content
      });
    } catch (error) {
      console.error("Error sharing content:", error);
    }
  }

  /**
   * Request user info with access token
   */
  static async getUserInfo() {
    try {
      const accessToken = await api.getAccessToken();
      const userInfo = await api.getUserInfo();
      return {
        accessToken: accessToken.accessToken,
        userInfo
      };
    } catch (error) {
      console.error("Error getting user info:", error);
      return null;
    }
  }

  /**
   * Close mini app with callback
   */
  static async closeMiniApp() {
    try {
      await api.closeApp();
    } catch (error) {
      console.error("Error closing app:", error);
    }
  }
}
