import { useParams } from 'zmp-ui';
import { Suspense } from 'react';
import { Page, Box, Spinner, Text } from 'zmp-ui';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';

const LoadingFallback = () => (
  <Page>
    <Box className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner visible />
        <Text className="mt-4">Đang tải...</Text>
      </div>
    </Box>
  </Page>
);

function BookingPage() {
  const { step } = useParams();
  const currentStep = Number(step ?? '1') - 1;
  const CurrentStep = [Step1, Step2, Step3][currentStep];

  return (
    <Suspense fallback={<LoadingFallback />}>
      <CurrentStep />
    </Suspense>
  );
}

export default BookingPage;
