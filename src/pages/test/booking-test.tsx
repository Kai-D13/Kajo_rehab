import React, { useState } from 'react';
import { Page, Box, Button, Text } from 'zmp-ui';
import { bookingFlowTester } from '../../test-booking-flow';

export default function BookingTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runEndToEndTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Capture console output
    const originalLog = console.log;
    const logs: string[] = [];

    console.log = (...args) => {
      const message = args.join(' ');
      logs.push(message);
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
    <Page className="booking-test-page">
      <Box className="p-4">
        <Text.Title className="mb-4">🧪 Booking Flow Test</Text.Title>
        
        <Button
          fullWidth
          variant="primary"
          onClick={runEndToEndTest}
          loading={isRunning}
          disabled={isRunning}
          className="mb-4"
        >
          {isRunning ? 'Running Test...' : 'Run End-to-End Test'}
        </Button>

        <Box className="bg-gray-100 p-3 rounded-lg max-h-96 overflow-y-auto">
          <Text.Header>Test Results:</Text.Header>
          {testResults.length === 0 && !isRunning && (
            <Text className="text-gray-500">Click button to run test</Text>
          )}
          
          {testResults.map((result, index) => (
            <Text 
              key={index} 
              size="small" 
              className={`block font-mono ${
                result.includes('✅') ? 'text-green-600' : 
                result.includes('❌') ? 'text-red-600' :
                result.includes('🎉') ? 'text-blue-600 font-bold' :
                result.includes('🔐') || result.includes('📋') || result.includes('🔲') || result.includes('🏥') ? 'text-purple-600' :
                'text-gray-700'
              }`}
            >
              {result}
            </Text>
          ))}
        </Box>
      </Box>
    </Page>
  );
}
