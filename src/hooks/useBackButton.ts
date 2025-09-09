import zmp from 'zmp-sdk';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useBackButton() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleBack = () => {
      navigate(-1);
    };
    
    zmp.setNavigationBarLeftButton({ 
      type: 'back'
    });
    
    // Set up back button event listener
    zmp.events.on('onLeftButtonTap', handleBack);
    
    return () => {
      zmp.events.off('onLeftButtonTap', handleBack);
    };
  }, [navigate]);
}
