import Layout from "@/components/layout";
import HomePage from "@/pages/home";
import { Route } from "zmp-ui";
import ServicesPage from "./pages/services";
import CategoriesPage from "./pages/categories";
import ExplorePage from "./pages/explore";
import ServiceDetailPage from "./pages/detail/service";
import NotFound from "./pages/404";
import BookingPage from "./pages/booking";
import BookingSuccess from "./pages/booking/success";
import NewBookingPage from "./pages/booking/new";
import NewEnhancedBookingPage from "./pages/booking/new-enhanced";
import BookingTestPage from "./pages/booking/test";
import ScheduleHistoryPage from "./pages/schedule/history";
import ScheduleDetailPage from "./pages/schedule/detail";
import ProfilePage from "./pages/profile";
import InvoicesPage from "./pages/invoices";
import AskPage from "./pages/ask";
import FeedbackPage from "./pages/feedback";
import SearchResultPage from "./pages/search";
import { ErrorBoundary } from "./components/error-boundary";
import { AuthGuard } from "./components/auth/auth-guard";
import DepartmentDetailPage from "./pages/detail/department";
import NewsPage from "./pages/news";
import MedicalRecordsPage from "./pages/medical-records";
import MedicalRecordDetailPage from "./pages/medical-records/detail";
import NewMedicalRecordPage from "./pages/medical-records/new";
import AdminDashboard from "./pages/admin";
import QRTestPage from "./pages/qr-test";
import QRStaticCheckIn from "./pages/checkin";
import DebugAppointmentsPage from "./pages/debug-appointments";

// Zalo Mini App Routes Configuration
export const routes = [
  {
    path: "/",
    element: <AuthGuard><Layout /></AuthGuard>,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/search",
        element: <SearchResultPage />,
      },
      {
        path: "/categories",
        element: <CategoriesPage />,
      },
      {
        path: "/explore", 
        element: <ExplorePage />,
      },
      {
        path: "/services",
        element: <ServicesPage />,
      },
      {
        path: "/service/:id",
        element: <ServiceDetailPage />,
      },
      {
        path: "/department/:id",
        element: <DepartmentDetailPage />,
      },
      {
        path: "/booking/:step?",
        element: <BookingPage />,
      },
      {
        path: "/booking/success",
        element: <BookingSuccess />,
      },
      {
        path: "/booking/new",
        element: <NewEnhancedBookingPage />,
      },
      {
        path: "/booking/new-original",
        element: <NewBookingPage />,
      },
      {
        path: "/booking/test", 
        element: <BookingTestPage />,
      },
      {
        path: "/ask",
        element: <AskPage />,
      },
      {
        path: "/feedback",
        element: <FeedbackPage />,
      },
      {
        path: "/schedule",
        element: <ScheduleHistoryPage />,
      },
      {
        path: "/schedule/:id",
        element: <ScheduleDetailPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/news/:id",
        element: <NewsPage />,
      },
      {
        path: "/invoices",
        element: <InvoicesPage />,
      },
      {
        path: "/medical-records",
        element: <MedicalRecordsPage />,
      },
      {
        path: "/medical-records/new",
        element: <NewMedicalRecordPage />,
      },
      {
        path: "/medical-records/:id",
        element: <MedicalRecordDetailPage />,
      },
      {
        path: "/admin",
        element: <AdminDashboard />,
      },
      {
        path: "/qr-test",
        element: <QRTestPage />,
      },
      {
        path: "/checkin",
        element: <QRStaticCheckIn />,
      },
      {
        path: "/debug-appointments",
        element: <DebugAppointmentsPage />,
      },
    ],
  },
];

export function getBasePath() {
  const urlParams = new URLSearchParams(window.location.search);
  const appEnv = urlParams.get("env");

  if (
    import.meta.env.PROD ||
    appEnv === "TESTING_LOCAL" ||
    appEnv === "TESTING" ||
    appEnv === "DEVELOPMENT"
  ) {
    return `/zapps/${window.APP_ID}`;
  }

  return window.BASE_PATH || "";
}
