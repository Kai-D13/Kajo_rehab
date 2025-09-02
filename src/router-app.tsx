import { ZMPRouter, AnimationRoutes, Route } from "zmp-ui";
import { ErrorBoundary } from "./components/error-boundary";
import Header from "./components/header";
import Footer from "./components/footer";
import { Toaster } from "react-hot-toast";
import { ScrollRestoration } from "./components/scroll-restoration";

// Pages - Following zaui-doctor template structure
import HomePage from "@/pages/home";
import ServicesPage from "./pages/services";
import CategoriesPage from "./pages/categories";
import ExplorePage from "./pages/explore";
import ServiceDetailPage from "./pages/detail/service";
import NotFound from "./pages/404";

// Main booking flow (zaui-doctor template)
import BookingPage from "./pages/booking";
import BookingSuccess from "./pages/booking/success";

// Additional booking flows for testing
import NewBookingPage from "./pages/booking/new";
import BookingTestPage from "./pages/booking/test-new";
import SimpleBookingPage from "./pages/booking/simple-booking";
import BookingDebugPage from "./pages/booking/debug";
import BookingFlowTest from "./pages/booking/booking-flow-test";

// Other pages
import SystemDashboardPage from "./pages/system-dashboard";
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
import QRTestPage from "./pages/qr-test";
import QRStaticCheckIn from "./pages/checkin";
import DebugAppointmentsPage from "./pages/debug-appointments";
import SystemDiagnosticsPage from "./pages/system-diagnostics";

export default function App() {
  return (
    <ZMPRouter>
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
            <Route path="/booking/success" element={<BookingSuccess />} />
            
            {/* Alternative booking flows for testing */}
            <Route path="/booking/simple" element={<SimpleBookingPage />} />
            <Route path="/booking/enhanced" element={<NewBookingPage />} />
            <Route path="/booking/test" element={<BookingTestPage />} />
            <Route path="/booking/debug" element={<BookingDebugPage />} />
            <Route path="/booking/e2e-test" element={<BookingFlowTest />} />
            
            <Route path="/system" element={<SystemDashboardPage />} />
            
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
            <Route path="/qr-test" element={<QRTestPage />} />
            <Route path="/checkin" element={<QRStaticCheckIn />} />
            <Route path="/debug-appointments" element={<DebugAppointmentsPage />} />
            <Route path="/system-diagnostics" element={<SystemDiagnosticsPage />} />
            
            {/* 404 - Must be last */}
            <Route path="*" element={<NotFound />} />
          </AnimationRoutes>
        </div>
        <Footer />
      </div>
      
      <Toaster position="top-center" />
      <ScrollRestoration />
    </ZMPRouter>
  );
}
