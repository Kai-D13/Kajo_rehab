import { useEffect } from 'react';
import { useRouter } from 'zmp-ui';
import zmp from 'zmp-sdk';

/**
 * Hook để thiết lập back button mặc định cho mọi trang phụ
 * Tự động gọi router.back() khi user nhấn nút back
 */
export function useBackButton() {
  const router = useRouter();

  useEffect(() => {
    // Set navigation bar left button to back
    zmp.setNavigationBarLeftButton({
      type: 'back',
      onClick: () => {
        console.log('🔙 Back button clicked');
        router.back();
      }
    });

    // Cleanup function
    return () => {
      // Reset to default if needed
      zmp.setNavigationBarLeftButton({
        type: 'back'
      });
    };
  }, [router]);
}
