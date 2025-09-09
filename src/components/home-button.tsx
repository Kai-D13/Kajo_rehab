import React from "react";
import { Icon, useNavigate } from "zmp-ui";

export default function HomeButton() {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/", {
      viewTransition: true,
      replace: true
    });
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-dark transition-all duration-200 active:scale-95"
      onClick={goHome}
    >
      <Icon icon="zi-home" size={24} />
    </div>
  );
}
