import ServiceMenu from './service-menu';
import QuickActions from './quick-actions';
import SearchBar from '../search/search-bar';
import FeaturedServices from './featured-services';
import RemoteDiagnosis from './remote-diagnosis';
import HealthNews from './health-news';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserProfile } from '@/components/auth/UserProfile';
import { Box } from 'zmp-ui';

function HomePage() {
  return (
    <AuthGuard>
      {/* User Profile Header */}
      <Box className="p-4 bg-blue-50">
        <UserProfile />
      </Box>
      
      <SearchBar className="mx-4" />
      <QuickActions />
      <ServiceMenu />
      <FeaturedServices />
      <RemoteDiagnosis />
      <HealthNews />
    </AuthGuard>
  );
}

export default HomePage;
