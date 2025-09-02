import React from 'react';
import { supabase } from '@/services/supabase';
import { config } from '@/config/production';

export const ConnectionTest: React.FC = () => {
  const [status, setStatus] = React.useState<{
    supabase: 'testing' | 'connected' | 'failed';
    message?: string;
  }>({
    supabase: 'testing'
  });

  React.useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    // Test Supabase
    try {
      console.log('🧪 Testing Supabase connection...');
      const { data, error } = await supabase.from('facilities').select('count').limit(1);
      
      if (error) throw error;
      
      setStatus({
        supabase: 'connected',
        message: 'Supabase connected successfully'
      });
      console.log('✅ Supabase connection successful');
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      setStatus({
        supabase: 'failed',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 m-4 shadow-sm">
      <h3 className="font-bold text-lg mb-3">🔗 Connection Status</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span>Supabase:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            status.supabase === 'connected' ? 'bg-green-100 text-green-800' :
            status.supabase === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status.supabase === 'connected' ? '✅ Connected' :
             status.supabase === 'failed' ? '❌ Failed' :
             '🔄 Testing...'}
          </span>
        </div>
        
        {status.message && (
          <div className="text-sm text-gray-600 mt-2">
            {status.message}
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t">
        <h4 className="font-semibold mb-2">Configuration:</h4>
        <div className="text-sm space-y-1">
          <div>URL: {config.supabase.url}</div>
          <div>Key: {config.supabase.anonKey ? '✓ Loaded' : '❌ Missing'}</div>
          <div>Mode: {config.isDevelopment ? 'Development' : 'Production'}</div>
        </div>
      </div>
    </div>
  );
};
