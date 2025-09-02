import React from 'react';

export const EnvDebug: React.FC = () => {
  const envVars = {
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ LOADED' : '❌ MISSING',
    'VITE_SUPABASE_SERVICE_ROLE_KEY': import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✓ LOADED' : '❌ MISSING',
    'VITE_ZALO_OA_ACCESS_TOKEN': import.meta.env.VITE_ZALO_OA_ACCESS_TOKEN ? '✓ LOADED' : '❌ MISSING',
    'VITE_ZALO_OA_ID': import.meta.env.VITE_ZALO_OA_ID,
    'VITE_ZALO_MINI_APP_ID': import.meta.env.VITE_ZALO_MINI_APP_ID,
    'VITE_ZALO_MINI_APP_SECRET': import.meta.env.VITE_ZALO_MINI_APP_SECRET ? '✓ LOADED' : '❌ MISSING',
    'DEV': import.meta.env.DEV ? 'true' : 'false',
    'MODE': import.meta.env.MODE,
  };

  React.useEffect(() => {
    console.log('🔍 Environment Variables Debug:', envVars);
    console.log('🔍 All available env vars:', import.meta.env);
  }, []);

  return (
    <div className="bg-gray-100 p-4 rounded-lg m-4">
      <h3 className="font-bold text-lg mb-3">Environment Variables Debug</h3>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} className="flex justify-between py-1 border-b">
          <span className="font-mono text-sm">{key}:</span>
          <span className="text-sm text-gray-600">{value || '❌ NOT SET'}</span>
        </div>
      ))}
    </div>
  );
};
