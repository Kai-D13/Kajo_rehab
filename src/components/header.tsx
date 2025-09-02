import { useAtomValue } from "jotai";
import { Button, Icon, Text, useNavigate } from "zmp-ui";
import React from "react";
import { useRouteHandle } from "@/hooks";
import { BackIcon } from "./icons/back";
import { customTitleState } from "@/state";
import { AuthService } from "@/services/auth.service";
import { getConfig } from "@/utils/miscellaneous";
import HeaderShieldIcon from "./icons/header-shield";

function ProfileHeader() {
  const user = AuthService.getCurrentUser();
  const zaloUser = AuthService.getCurrentZaloUser();

  if (!user || !zaloUser) {
    return (
      <div className="flex items-center justify-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="w-40 font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-3">
      <img
        src={user.avatar || zaloUser.avatar}
        alt={`${user.name || zaloUser.name} avatar`}
        className="rounded-full h-10 w-10 object-cover border border-white"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNkZGQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Vc2VyPC90ZXh0Pgo8L3N2Zz4K';
        }}
      />
      <div className="w-40 font-medium">{user.name}</div>
    </div>
  );
}

function CustomTitle() {
  const title = useAtomValue(customTitleState);
  return title;
}

export default function Header() {
  // Add error boundary for router hooks
  let navigate, location, handle, match;
  
  try {
    navigate = useNavigate();
    location = useLocation();
    [handle, match] = useRouteHandle();
  } catch (error) {
    console.warn('Header: Router hooks not available, using fallback');
    // Fallback when not in router context
    return (
      <header className="flex-none w-full min-h-12 pr-[90px] px-4 pt-st pb-2 space-x-2">
        <div className="flex items-center min-h-12">
          <div className="flex items-center justify-center space-x-3">
            <HeaderShieldIcon />
            <div className="text-lg font-medium">{getConfig((c) => c.app.title)}</div>
          </div>
        </div>
      </header>
    );
  }

  const showMainHeader = !handle?.back;
  const showBack = location.key !== "default" && handle?.back !== false;

  return (
    <header
      className={`flex-none w-full min-h-12 pr-[90px] px-4 pt-st pb-2 space-x-2 ${showMainHeader ? "" : "bg-white"}`}
    >
      <div className="flex items-center min-h-12">
        {showMainHeader ? (
          <>
            <div className="fixed inset-0 h-[230px] z-0 bg-gradient-to-br from-highlight from-[1.36%] to-background to-[61.49%]" />
            <HeaderShieldIcon className="fixed top-0 right-0" />
            <div className="relative z-10">
              {handle.profile ? (
                <ProfileHeader />
              ) : (
                <div className="flex items-center text-primary space-x-1.5">
                  <h1 className="text-xl font-bold">
                    {getConfig((c) => c.app.title)}
                  </h1>
                  <span>|</span>
                  <span className="text-base">Chào bạn</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {showBack && (
              <div
                className="py-1 px-2 cursor-pointer"
                onClick={() =>
                  navigate(-1 as To, {
                    viewTransition: true,
                  })
                }
              >
                <BackIcon />
              </div>
            )}
            <div className="text-xl font-medium truncate">
              {handle.title === "custom" ? <CustomTitle /> : handle.title}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
