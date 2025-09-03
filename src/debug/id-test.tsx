import React from 'react';

export function IdTestPage() {
  const testIds = [
    'b1c75529-6b42-462e-a875-3583c12d177c',
    '7ba896c9-36d9-434f-9ee8-def4dc37870b',
    'b4295531-e0c8-4d8f-97f4-a3e92e7b2747'
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">🔍 ID Format Test</h1>
      <div className="space-y-4">
        {testIds.map(id => (
          <div key={id} className="p-3 bg-gray-100 rounded">
            <p className="font-mono text-sm">Original UUID: {id}</p>
            <a 
              href={`/schedule/detail/${id}`}
              className="text-blue-600 underline text-sm"
            >
              Test Detail Link →
            </a>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h2 className="font-bold">✅ Fixes Applied:</h2>
        <ul className="text-sm mt-2 space-y-1">
          <li>• Booking interface supports string | number IDs</li>
          <li>• History page preserves original UUID strings</li>
          <li>• Detail page handles UUID lookups correctly</li>
          <li>• Enhanced error messages for booking conflicts</li>
        </ul>
      </div>
    </div>
  );
}
