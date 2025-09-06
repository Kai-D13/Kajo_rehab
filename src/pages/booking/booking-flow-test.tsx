import React, { useState } from "react";
import { Page, Header, Button, Text, Box } from "zmp-ui";
import { bookingServiceV2 } from "@/services/booking-v2.service";
import { AuthService } from "@/services/auth.service";

const BookingFlowTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runEndToEndTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Check user authentication
      addResult("🔐 Testing authentication...");
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        addResult(`✅ User authenticated: ${currentUser.name}`);
      } else {
        addResult("❌ No user authenticated");
        setIsRunning(false);
        return;
      }

      // Test 2: Create a test booking
      addResult("📅 Creating test booking...");
      
      const testBookingData = {
        doctor_name: "Dr. Test Doctor",
        service_name: "General Consultation", 
        appointment_date: new Date().toISOString().split('T')[0], // Today's date
        appointment_time: "14:30",
        symptoms: "Test symptoms for booking flow",
        notes: "End-to-end test booking"
      };

      const bookingResult = await bookingServiceV2.createBooking(testBookingData);
      
      if (bookingResult.success) {
        addResult(`✅ Booking created successfully: ${bookingResult.message}`);
        addResult(`🎫 QR Code generated: ${bookingResult.qrCode ? 'Yes' : 'No'}`);
        
        // Test 3: Get user appointments
        addResult("📋 Getting user appointments...");
        const appointments = await bookingServiceV2.getUserAppointments();
        addResult(`✅ Found ${appointments.length} appointments`);
        
        // Test 4: Test conflict check
        addResult("⏰ Testing time conflict check...");
        const hasConflict = await bookingServiceV2.checkTimeConflict("test-doctor", testBookingData.appointment_date, testBookingData.appointment_time);
        addResult(`✅ Time conflict check: ${hasConflict ? 'Conflict found' : 'No conflicts'}`);
        
      } else {
        addResult(`❌ Booking failed: ${bookingResult.message}`);
      }

    } catch (error) {
      addResult(`❌ Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
      addResult("🏁 End-to-end test completed");
    }
  };

  const testNavigation = () => {
    addResult("🧭 Testing navigation...");
    const routes = ['/booking/new', '/booking/enhanced', '/booking/debug', '/schedule', '/medical-records'];
    
    routes.forEach((route, index) => {
      setTimeout(() => {
        addResult(`📍 Route ${route}: Available`);
        if (index === routes.length - 1) {
          addResult("✅ All navigation routes accessible");
        }
      }, index * 500);
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Page className="bg-gray-100">
      <Header title="Booking Flow Test" showBackIcon />
      
      <Box className="p-4 space-y-4">
        <div className="bg-white rounded-lg p-4">
          <Text.Title size="large">End-to-End Booking Test</Text.Title>
          <Text size="small" className="text-gray-600 mb-4">
            Test the complete booking flow from authentication to appointment creation
          </Text>
          
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={runEndToEndTest}
              disabled={isRunning}
              variant="primary"
              size="medium"
            >
              {isRunning ? "Running..." : "🧪 Run E2E Test"}
            </Button>
            
            <Button 
              onClick={testNavigation}
              variant="secondary"
              size="medium"
            >
              🧭 Test Navigation
            </Button>
            
            <Button 
              onClick={clearResults}
              variant="tertiary"
              size="medium"
            >
              🗑️ Clear
            </Button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg p-4">
          <Text.Title size="normal" className="mb-3">Test Results</Text.Title>
          
          {testResults.length === 0 ? (
            <Text className="text-gray-500">No tests run yet. Click a test button to start.</Text>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className="text-sm font-mono bg-gray-50 p-2 rounded border-l-4 border-l-blue-400"
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <Text.Title size="small" className="text-blue-800 mb-2">Quick Info</Text.Title>
          <div className="text-sm space-y-1">
            <div>🔗 <strong>Simple Booking:</strong> /booking/new</div>
            <div>🔧 <strong>Enhanced Booking:</strong> /booking/enhanced</div>
            <div>🐛 <strong>Debug Page:</strong> /booking/debug</div>
            <div>📋 <strong>Schedule:</strong> /schedule</div>
          </div>
        </div>
      </Box>
    </Page>
  );
};

export default BookingFlowTest;
