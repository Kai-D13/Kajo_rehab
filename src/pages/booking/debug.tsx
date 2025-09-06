import React from 'react';
import { Page, Box, Button, Text } from 'zmp-ui';
import { useNavigate, useLocation } from 'zmp-ui';

export default function BookingDebugPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const testRoutes = [
    { path: '/', name: 'Home' },
    { path: '/booking', name: 'Original Booking' },
    { path: '/booking/new', name: 'Simple Booking' },
    { path: '/booking/enhanced', name: 'Enhanced Booking' },
    { path: '/booking/test', name: 'Test Suite' },
    { path: '/schedule', name: 'Schedule' },
    { path: '/system', name: 'System Dashboard' }
  ];

  return (
    <Page className="bg-gray-50">
      <Box className="bg-blue-500 text-white p-4">
        <Text.Title className="text-white font-bold">🔧 Navigation Debug</Text.Title>
        <Text className="text-blue-100">Current: {location.pathname}</Text>
      </Box>

      <Box className="p-4">
        <div className="bg-white rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Test Routes</h2>
          <div className="grid grid-cols-1 gap-2">
            {testRoutes.map(route => (
              <Button
                key={route.path}
                variant={location.pathname === route.path ? 'primary' : 'secondary'}
                className="text-left justify-start"
                onClick={() => {
                  console.log(`🎯 Navigating to: ${route.path}`);
                  navigate(route.path);
                }}
              >
                {route.name} - {route.path}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🔍 Debug Info</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>Pathname:</strong> {location.pathname}</p>
            <p><strong>Search:</strong> {location.search}</p>
            <p><strong>Hash:</strong> {location.hash}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent.slice(0, 50)}...</p>
          </div>
        </div>
      </Box>
    </Page>
  );
}
