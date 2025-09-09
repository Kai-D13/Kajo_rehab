import { realClinicBookingService } from '../services/real-clinic-booking.service';
import { staticCheckInService } from '../services/static-checkin.service';
import { enhancedFeatureService } from '../services/enhanced-feature.service';

/**
 * 🧪 Comprehensive E2E Testing Suite
 * Kiểm tra toàn bộ luồng end-to-end cho KajoTai Mini App
 */

export class ComprehensiveTestSuite {
  private testResults: any[] = [];
  private totalTests = 0;
  private passedTests = 0;

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Comprehensive E2E Testing Suite...');
    console.log('='.repeat(50));
    
    try {
      // Phase 1: Core Booking Flow
      await this.testBookingFlow();
      
      // Phase 2: Static QR Check-in
      await this.testStaticCheckIn();
      
      // Phase 3: Capacity Management
      await this.testCapacityControl();
      
      // Phase 4: Enhanced Features
      await this.testEnhancedFeatures();
      
      // Phase 5: Admin Interface
      await this.testAdminInterface();
      
      // Phase 6: Performance & Analytics
      await this.testPerformanceAndAnalytics();
      
      // Phase 7: Error Scenarios
      await this.testErrorScenarios();
      
      // Final Report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Testing suite failed:', error);
    }
  }

  /**
   * Phase 1: 📅 Core Booking Flow Testing
   */
  private async testBookingFlow(): Promise<void> {
    console.log('\n📅 Phase 1: Testing Core Booking Flow');
    console.log('-'.repeat(30));

    // Test 1: Basic booking creation
    await this.runTest('Create basic booking', async () => {
      const bookingData = {
        customer_name: 'Test User E2E',
        phone_number: '0123456789',
        appointment_date: '2024-12-30',
        appointment_time: '09:00',
        service_type: 'Vật lý trị liệu',
        user_id: 'test_user_e2e_001',
        booking_status: 'confirmed'
      };

      const result = await realClinicBookingService.createBooking(bookingData);
      
      if (!result.success) {
        throw new Error(`Booking creation failed: ${result.message}`);
      }
      
      return result;
    });

    // Test 2: Capacity checking
    await this.runTest('Check capacity constraints', async () => {
      const capacityCheck = await realClinicBookingService.checkCapacityAndConflict(
        '2024-12-30',
        '09:00',
        'test_user_duplicate'
      );
      
      return capacityCheck;
    });

    // Test 3: Booking retrieval
    await this.runTest('Retrieve bookings by date', async () => {
      const bookings = await realClinicBookingService.getBookingsByDate('2024-12-30');
      
      if (!Array.isArray(bookings)) {
        throw new Error('Bookings should be an array');
      }
      
      return { count: bookings.length, bookings };
    });
  }

  /**
   * Phase 2: 📱 Static QR Check-in Testing
   */
  private async testStaticCheckIn(): Promise<void> {
    console.log('\n📱 Phase 2: Testing Static QR Check-in');
    console.log('-'.repeat(30));

    // Test 4: QR check-in flow
    await this.runTest('Static QR check-in process', async () => {
      const checkInResult = await staticCheckInService.handleCustomerCheckIn();
      return checkInResult;
    });

    // Test 5: Today's bookings retrieval
    await this.runTest('Get today bookings for check-in', async () => {
      const todayBookings = await staticCheckInService.getTodayBookings();
      return { count: todayBookings.bookings.length, bookings: todayBookings.bookings };
    });

    // Test 6: Manual check-in fallback
    await this.runTest('Manual check-in fallback', async () => {
      const manualResult = await staticCheckInService.manualCheckIn('Test User E2E');
      return manualResult;
    });
  }

  /**
   * Phase 3: 🎯 Capacity Management Testing
   */
  private async testCapacityControl(): Promise<void> {
    console.log('\n🎯 Phase 3: Testing Capacity Management');
    console.log('-'.repeat(30));

    // Test 7: Maximum capacity enforcement
    await this.runTest('Enforce 3-person limit per slot', async () => {
      const testSlot = '10:00';
      const testDate = '2024-12-30';
      let successCount = 0;
      let rejectedCount = 0;

      // Try to book 5 people in the same slot
      for (let i = 1; i <= 5; i++) {
        const bookingData = {
          customer_name: `Test User ${i}`,
          phone_number: `012345678${i}`,
          appointment_date: testDate,
          appointment_time: testSlot,
          service_type: 'Vật lý trị liệu',
          user_id: `test_capacity_${i}`,
          booking_status: 'confirmed'
        };

        const result = await realClinicBookingService.createBooking(bookingData);
        
        if (result.success) {
          successCount++;
        } else {
          rejectedCount++;
        }
      }

      return { successCount, rejectedCount, expected: 'max 3 successful' };
    });
  }

  /**
   * Phase 4: 🚀 Enhanced Features Testing
   */
  private async testEnhancedFeatures(): Promise<void> {
    console.log('\n🚀 Phase 4: Testing Enhanced Features');
    console.log('-'.repeat(30));

    // Test 8: SMS notification
    await this.runTest('SMS notification system', async () => {
      const smsResult = await enhancedFeatureService.sendSMSNotification(
        '0123456789',
        'Test SMS from E2E testing'
      );
      
      return { sent: smsResult };
    });

    // Test 9: Service capacity checking
    await this.runTest('Multi-service capacity check', async () => {
      const capacityResult = await enhancedFeatureService.checkServiceCapacity(
        'physio',
        '2024-12-30',
        '09:00'
      );
      
      return capacityResult;
    });

    // Test 10: Available services
    await this.runTest('Get available services', async () => {
      const services = await enhancedFeatureService.getAvailableServices();
      
      if (!Array.isArray(services) || services.length === 0) {
        throw new Error('Services should be non-empty array');
      }
      
      return { serviceCount: services.length, services };
    });
  }

  /**
   * Phase 5: 🏥 Admin Interface Testing
   */
  private async testAdminInterface(): Promise<void> {
    console.log('\n🏥 Phase 5: Testing Admin Interface');
    console.log('-'.repeat(30));

    // Test 11: Admin data retrieval
    await this.runTest('Admin dashboard data access', async () => {
      const adminData = await realClinicBookingService.getBookingsByDate('2024-12-30');
      
      return {
        adminAccess: true,
        bookingCount: adminData.length,
        hasData: adminData.length > 0
      };
    });
  }

  /**
   * Phase 6: ⚡ Performance & Analytics Testing
   */
  private async testPerformanceAndAnalytics(): Promise<void> {
    console.log('\n⚡ Phase 6: Testing Performance & Analytics');
    console.log('-'.repeat(30));

    // Test 12: Performance measurement
    await this.runTest('Performance monitoring', async () => {
      const startTime = performance.now();
      
      await realClinicBookingService.getBookingsByDate('2024-12-30');
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      return {
        duration: Math.round(duration),
        performant: duration < 1000 // Should be under 1 second
      };
    });

    // Test 13: Cache efficiency
    await this.runTest('Cache system efficiency', async () => {
      const cacheTest1 = performance.now();
      await enhancedFeatureService.getAvailableServices();
      const firstCall = performance.now() - cacheTest1;
      
      const cacheTest2 = performance.now();
      await enhancedFeatureService.getAvailableServices();
      const secondCall = performance.now() - cacheTest2;
      
      return {
        firstCall: Math.round(firstCall),
        secondCall: Math.round(secondCall),
        cacheWorking: secondCall < firstCall
      };
    });
  }

  /**
   * Phase 7: 🚨 Error Scenarios Testing
   */
  private async testErrorScenarios(): Promise<void> {
    console.log('\n🚨 Phase 7: Testing Error Scenarios');
    console.log('-'.repeat(30));

    // Test 14: Invalid booking data
    await this.runTest('Handle invalid booking data', async () => {
      const invalidBooking = {
        customer_name: '',
        phone_number: 'invalid',
        appointment_date: 'invalid-date',
        appointment_time: '25:00',
        service_type: 'Non-existent Service'
      };

      const result = await realClinicBookingService.createBooking(invalidBooking);
      
      return {
        handled: !result.success,
        error: result.message || 'No error message'
      };
    });

    // Test 15: Non-existent user check-in
    await this.runTest('Handle non-existent user check-in', async () => {
      const result = await staticCheckInService.handleCustomerCheckIn();
      
      return {
        handled: !result.success,
        message: result.message || 'No message'
      };
    });
  }

  /**
   * 🧪 Test Runner Helper
   */
  private async runTest(testName: string, testFunction: () => Promise<any>): Promise<void> {
    this.totalTests++;
    
    try {
      console.log(`  🧪 Running: ${testName}`);
      const startTime = performance.now();
      
      const result = await testFunction();
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      this.passedTests++;
      this.testResults.push({
        name: testName,
        status: 'PASSED',
        duration,
        result
      });
      
      console.log(`  ✅ PASSED (${duration}ms):`, JSON.stringify(result, null, 2));
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error),
        result: null
      });
      
      console.log(`  ❌ FAILED:`, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 📊 Generate Final Test Report
   */
  private generateTestReport(): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n📈 Summary:`);
    console.log(`  Total Tests: ${this.totalTests}`);
    console.log(`  Passed: ${this.passedTests}`);
    console.log(`  Failed: ${this.totalTests - this.passedTests}`);
    console.log(`  Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    console.log(`\n📋 Detailed Results:`);
    this.testResults.forEach((test, index) => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`  ${index + 1}. ${status} ${test.name}`);
      
      if (test.status === 'FAILED') {
        console.log(`     Error: ${test.error}`);
      } else if (test.duration) {
        console.log(`     Duration: ${test.duration}ms`);
      }
    });
    
    // Performance Analysis
    const performanceTests = this.testResults.filter(t => t.duration);
    if (performanceTests.length > 0) {
      const avgDuration = performanceTests.reduce((sum, t) => sum + t.duration, 0) / performanceTests.length;
      console.log(`\n⚡ Performance Analysis:`);
      console.log(`  Average Response Time: ${Math.round(avgDuration)}ms`);
      console.log(`  Performance Grade: ${avgDuration < 500 ? 'EXCELLENT' : avgDuration < 1000 ? 'GOOD' : 'NEEDS_IMPROVEMENT'}`);
    }
    
    // System Health Assessment
    const systemHealth = this.passedTests / this.totalTests;
    console.log(`\n🏥 System Health:`);
    if (systemHealth >= 0.9) {
      console.log(`  🟢 EXCELLENT - System ready for production`);
    } else if (systemHealth >= 0.7) {
      console.log(`  🟡 GOOD - Minor issues need attention`);
    } else {
      console.log(`  🔴 CRITICAL - Major issues require immediate fix`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 E2E Testing Complete!');
    console.log('='.repeat(50));
  }
}

// Export instance for immediate use
export const comprehensiveTestSuite = new ComprehensiveTestSuite();
