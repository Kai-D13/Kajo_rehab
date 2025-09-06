import React from 'react';
import { Page, Box, Text, Button } from 'zmp-ui';

const SimpleTestPage: React.FC = () => {
  return (
    <Page className="bg-white">
      <Box className="p-4">
        <Text size="xLarge" bold className="text-center mb-6">
          ✅ Simple Test Page Works!
        </Text>
        
        <Text className="text-center">
          This page is working correctly. Route is functioning.
        </Text>

        <Box className="mt-4">
          <Button 
            fullWidth
            variant="primary"
            onClick={() => alert('Button clicked!')}
          >
            Test Button
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default SimpleTestPage;
