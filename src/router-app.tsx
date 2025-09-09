import { ZMPRouter, AnimationRoutes, Route } from "zmp-ui";
import { ErrorBoundary } from "./components/error-boundary";
import Header from "./components/header";
import Footer from "./components/footer";
import HomeButton from "./components/home-button";
import { Toaster } from "react-hot-toast";
import { ScrollRestoration } from "./components/scroll-restoration";
import { useLocation } from "zmp-ui";

// Pages - Following zaui-doctor template structure
import HomePage from "@/pages/home";
import ServicesPage from "./pages/services";
import CategoriesPage from "./pages/categories";
import ExplorePage from "./pages/explore";
import ServiceDetailPage from "./pages/detail/service";
import NotFound from "./pages/404";

// Main booking flow (zaui-doctor template)
import BookingPage from "./pages/booking";

// Other pages
import ScheduleHistoryPage from "./pages/schedule/history";
import ScheduleDetailPage from "./pages/schedule/detail";
import ProfilePage from "./pages/profile";
import InvoicesPage from "./pages/invoices";
import AskPage from "./pages/ask";
import FeedbackPage from "./pages/feedback";
import SearchResultPage from "./pages/search";
import DepartmentDetailPage from "./pages/detail/department";
import NewsPage from "./pages/news";
import MedicalRecordsPage from "./pages/medical-records";
import MedicalRecordDetailPage from "./pages/medical-records/detail";
import NewMedicalRecordPage from "./pages/medical-records/new";
import AdminDashboard from "./pages/admin";
import QRStaticCheckIn from "./pages/checkin";

export default function App() {
  return (
    <ZMPRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <InnerApp />
    </ZMPRouter>
  );
}

function InnerApp() {
  const location = useLocation();
  const showHomeButton = location.pathname !== "/";
  
  return (
    <div className="w-screen h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex-1 flex flex-col z-10 overflow-y-auto">
        <AnimationRoutes>
          {/* Home */}
          <Route path="/" element={<HomePage />} />
          
          {/* Core pages */}
          <Route path="/search" element={<SearchResultPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/service/:id" element={<ServiceDetailPage />} />
          <Route path="/department/:id" element={<DepartmentDetailPage />} />
          
          {/* Main booking flow - zaui-doctor template */}
          <Route path="/booking/:step?" element={<BookingPage />} />
          
          {/* Schedule & Medical Records */}
          <Route path="/schedule" element={<ScheduleHistoryPage />} />
          <Route path="/schedule/:id" element={<ScheduleDetailPage />} />
          <Route path="/medical-records" element={<MedicalRecordsPage />} />
          <Route path="/medical-records/new" element={<NewMedicalRecordPage />} />
          <Route path="/medical-records/:id" element={<MedicalRecordDetailPage />} />
          
          {/* Other routes */}
          <Route path="/ask" element={<AskPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/news/:id" element={<NewsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/checkin" element={<QRStaticCheckIn />} />
          
          {/* 404 - Must be last */}
          <Route path="*" element={<NotFound />} />
        </AnimationRoutes>
      </div>
      <Footer />
      
      {/* Global Home Button */}
      {showHomeButton && <HomeButton />}
      
      <Toaster position="top-center" />
      <ScrollRestoration />
    </div>
  );
}
