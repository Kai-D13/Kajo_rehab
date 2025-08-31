import { ZMPRouter, AnimationRoutes, Route } from "zmp-ui";
import { ErrorBoundary } from "./components/error-boundary";
import Header from "./components/header";
import Footer from "./components/footer";
import { Toaster } from "react-hot-toast";
import { ScrollRestoration } from "./components/scroll-restoration";

// Pages
import HomePage from "@/pages/home";
import ServicesPage from "./pages/services";
import CategoriesPage from "./pages/categories";
import ExplorePage from "./pages/explore";
import ServiceDetailPage from "./pages/detail/service";
import NotFound from "./pages/404";
import BookingPage from "./pages/booking";
import NewBookingPage from "./pages/booking/new";
import BookingTestPage from "./pages/booking/test";
import ScheduleHistoryPage from "./pages/schedule/history";
import ScheduleDetailPage from "./pages/schedule/detail";
import ProfilePage from "./pages/profile";
import InvoicesPage from "./pages/invoices";
import AskPage from "./pages/ask";
import FeedbackPage from "./pages/feedback";
import SearchResultPage from "./pages/search";
import DepartmentDetailPage from "./pages/detail/department";
import NewsPage from "./pages/news";

export default function App() {
  return (
    <ZMPRouter>
      <div className="w-screen h-screen flex flex-col bg-background text-foreground overflow-hidden">
        <Header />
        <div className="flex-1 flex flex-col z-10 overflow-y-auto">
          <AnimationRoutes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service/:id" element={<ServiceDetailPage />} />
            <Route path="/department/:id" element={<DepartmentDetailPage />} />
            
            {/* Booking routes */}
            <Route path="/booking/:step?" element={<BookingPage />} />
            <Route path="/booking/new" element={<NewBookingPage />} />
            <Route path="/booking/test" element={<BookingTestPage />} />
            
            {/* Other routes */}
            <Route path="/ask" element={<AskPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/schedule" element={<ScheduleHistoryPage />} />
            <Route path="/schedule/:id" element={<ScheduleDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/news/:id" element={<NewsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="*" element={<NotFound />} />
          </AnimationRoutes>
        </div>
        <Footer />
        <Toaster containerClassName="toast-container" position="bottom-center" />
        <ScrollRestoration />
      </div>
    </ZMPRouter>
  );
}
