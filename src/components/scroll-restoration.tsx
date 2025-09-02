import { FC, useEffect } from "react";

export const ScrollRestoration: FC = () => {
  useEffect(() => {
    // Simple scroll restoration for Zalo Mini App
    const pathname = window.location.pathname;
    const key = `scroll-${pathname}`;
    
    // Restore scroll position
    const savedPosition = sessionStorage.getItem(key);
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition, 10));
      }, 100);
    }
    
    // Save scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem(key, window.scrollY.toString());
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
};
