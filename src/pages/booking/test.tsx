import React, { useState } from 'react';
import { useNavigate } from 'zmp-ui';
import { Button } from '@/components/button';
import { bookingFlowTester } from '../../test-booking-flow';

export default function BookingTestPage() {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  React.useEffect(() => {
    console.log('✅ BookingTestPage mounted - End-to-End Test Ready');
  }, []);

  const runEndToEndTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Capture console output
    const originalLog = console.log;

    console.log = (...args) => {
      const message = args.join(' ');
      setTestResults(prev => [...prev, message]);
      originalLog(...args);
    };

    try {
      await bookingFlowTester.runCompleteTest();
    } catch (error) {
      console.log('❌ Test failed:', error);
    }

    // Restore console
    console.log = originalLog;
    setIsRunning(false);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            🧪 End-to-End Booking Test
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            Test toàn bộ luồng: Authentication → Booking → QR Generation → Reception
          </p>
          
          <div className="flex gap-3 mb-4">
            <Button
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                isRunning 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              onClick={runEndToEndTest}
              disabled={isRunning}
            >
              {isRunning ? 'Running Test...' : '🚀 Run Complete Test'}
            </Button>
            
            <Button
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => navigate('/')}
            >
              ← Back
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium text-gray-800">Test Results</h2>
            {testResults.length > 0 && (
              <button
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => setTestResults([])}
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
            {testResults.length === 0 && !isRunning && (
              <div className="text-gray-500">Click "Run Complete Test" to start...</div>
            )}
            
            {isRunning && testResults.length === 0 && (
              <div className="text-yellow-400">⏳ Initializing test...</div>
            )}
            
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`mb-1 ${
                  result.includes('✅') ? 'text-green-400' : 
                  result.includes('❌') ? 'text-red-400' :
                  result.includes('🎉') ? 'text-blue-400 font-bold' :
                  result.includes('Phase') ? 'text-yellow-400 font-medium' :
                  result.includes('┌') || result.includes('│') || result.includes('└') ? 'text-cyan-400' :
                  'text-gray-300'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

  React.useEffect(() => {
    console.log('✅ BookingTestPage mounted with zmp-ui Router (working version)');
  }, []);

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          🎯 Test Page - ZMP Router Working
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">Navigation hoạt động với ZMP UI Router</p>
          
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg"
            onClick={() => {
              console.log('ZMP Router Button clicked, navigating back...');
              navigate('/');
            }}
          >
            ← Quay về trang chủ
          </Button>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-medium mb-2">
              ✅ ZMP Router đã hoạt động:
            </p>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Navigation từ Quick Actions OK</li>
              <li>• Component render thành công</li>
              <li>• Không lỗi useLocation() nữa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
