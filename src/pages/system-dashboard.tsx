import React from 'react';
import { useNavigate } from 'zmp-ui';
import { Button } from '@/components/button';

export default function SystemDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">🏥 KAJO REHAB System Dashboard</h1>
          <p className="opacity-90">Zalo Mini App - Complete Healthcare Booking System</p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-600">SERVER STATUS</span>
            </div>
            <p className="text-lg font-bold text-green-600 mt-1">ONLINE</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-600">ZMP ROUTER</span>
            </div>
            <p className="text-lg font-bold text-blue-600 mt-1">ACTIVE</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-600">DATABASE</span>
            </div>
            <p className="text-lg font-bold text-purple-600 mt-1">MOCK</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-600">QR SERVICE</span>
            </div>
            <p className="text-lg font-bold text-yellow-600 mt-1">READY</p>
          </div>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* User Flow */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              👤 User Flow Testing
            </h2>
            <div className="space-y-3">
              <Button
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200"
                onClick={() => navigate('/booking/new')}
              >
                📋 Enhanced Booking Flow
              </Button>
              <Button
                className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200"
                onClick={() => navigate('/booking/test')}
              >
                🧪 End-to-End Test
              </Button>
              <Button
                className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200"
                onClick={() => navigate('/schedule')}
              >
                📅 View Schedule
              </Button>
            </div>
          </div>

          {/* System Architecture */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              ⚙️ System Architecture
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Frontend</span>
                <span className="font-medium text-blue-600">Zalo Mini App</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Router</span>
                <span className="font-medium text-green-600">ZMP-UI Router</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">State Management</span>
                <span className="font-medium text-purple-600">React Hooks</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Storage</span>
                <span className="font-medium text-yellow-600">Mock + Supabase Ready</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Authentication</span>
                <span className="font-medium text-red-600">Zalo Auth Service</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🔄 Complete Booking Flow</h2>
          <div className="flex flex-wrap items-center justify-between text-sm bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <span className="ml-2 text-gray-700">User Authentication</span>
            </div>
            <div className="hidden md:block text-gray-400">→</div>
            
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <span className="ml-2 text-gray-700">Booking Creation</span>
            </div>
            <div className="hidden md:block text-gray-400">→</div>
            
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <span className="ml-2 text-gray-700">QR Generation</span>
            </div>
            <div className="hidden md:block text-gray-400">→</div>
            
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <span className="ml-2 text-gray-700">Reception Check-in</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              onClick={() => navigate('/')}
            >
              🏠 Home
            </Button>
            <Button
              className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              onClick={() => navigate('/booking/new')}
            >
              📝 New Booking
            </Button>
            <Button
              className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              onClick={() => navigate('/booking/test')}
            >
              🧪 Run Test
            </Button>
            <Button
              className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
              onClick={() => {
                console.log('🎯 Opening system in production mode...');
                window.open('http://localhost:8080', '_blank');
              }}
            >
              🚀 Production
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 py-4 text-gray-500 text-sm">
          <p>🏥 KAJO REHAB Healthcare System v1.0 | Zalo Mini App Platform</p>
          <p className="mt-1">Built with React + TypeScript + ZMP-UI</p>
        </div>
      </div>
    </div>
  );
}
