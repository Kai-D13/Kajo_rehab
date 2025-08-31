import React from 'react';
import { Page } from 'zmp-ui';
import { QRTest } from '../components/qr-test';

const QRTestPage: React.FC = () => {
  return (
    <Page className="bg-gray-50">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">QR Service Test</h1>
        <QRTest />
      </div>
    </Page>
  );
};

export default QRTestPage;
