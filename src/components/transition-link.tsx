import { useNavigate } from "zmp-ui";
import React from "react";

export interface TransitionLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Wrapper component for ZMP navigation
 */
export default function TransitionLink({ to, children, className, onClick }: TransitionLinkProps) {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    navigate(to);
  };

  return (
    <div 
      className={className} 
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
}
