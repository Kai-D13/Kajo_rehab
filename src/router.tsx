import Layout from "@/components/layout";
import HomePage from "@/pages/home";
import { createBrowserRouter } from "react-router-dom";
import ServicesPage from "./pages/services";
import CategoriesPage from "./pages/categories";
import ExplorePage from "./pages/explore";
import ServiceDetailPage from "./pages/detail/service";
import NotFound from "./pages/404";
import BookingPage from "./pages/booking";
import BookingSuccess from "./pages/booking/success";
import NewBookingPage from "./pages/booking/new";
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

const router = createBrowserRouter(
  [
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
          handle: {
            back: true,
            title: "Danh mục",
            noScroll: true,
          },
        },
        {
          path: "/explore",
          element: <ExplorePage />,
        },
        {
          path: "/services",
          element: <ServicesPage />,
          handle: {
            back: true,
            title: "Tất cả dịch vụ",
          },
        },
        {
          /**
           * Accepted params:
           * - `tab`: to change to default tab (this page has 3 tabs). For example, to visit the doctor tab, navigate to /service/1?tab=2
           * - `doctor`: to default pick a doctor. For example: /service/1?tab=2&doctor=1
           */
          path: "/service/:id",
          element: <ServiceDetailPage />,
          handle: {
            back: true,
            title: "custom",
          },
        },
        {
          /**
           * Accepted params like above
           */
          path: "/department/:id",
          element: <DepartmentDetailPage />,
          handle: {
            back: true,
            title: "custom",
          },
        },
        {
          path: "/booking/:step?",
          element: <BookingPage />,
          handle: {
            back: true,
            title: "Đặt lịch khám",
          },
        },
        {
          path: "/booking/success",
          element: <BookingSuccess />,
          handle: {
            back: false,
            title: "Đặt lịch thành công",
          },
        },
        {
          path: "/booking/new",
          element: <NewBookingPage />,
          handle: {
            back: true,
            title: "Đặt lịch mới",
          },
        },
        {
          path: "/booking/test", 
          element: <BookingTestPage />,
          handle: {
            back: true,
            title: "Test Booking",
          },
        },
        {
          path: "/ask",
          element: <AskPage />,
          handle: {
            back: true,
            title: "Gửi câu hỏi",
          },
        },
        {
          path: "/feedback",
          element: <FeedbackPage />,
          handle: {
            back: true,
            title: "Gửi phản ảnh",
          },
        },
        {
          path: "/schedule",
          element: <ScheduleHistoryPage />,
        },
        {
          path: "/schedule/:id",
          element: <ScheduleDetailPage />,
          handle: {
            back: true,
            title: "Chi tiết",
          },
        },
        {
          path: "/profile",
          element: <ProfilePage />,
          handle: {
            profile: true,
          },
        },
        {
          path: "/news/:id",
          element: <NewsPage />,
          handle: {
            back: true,
            title: "Tin tức",
          },
        },
        {
          path: "/invoices",
          element: <InvoicesPage />,
          handle: {
            back: true,
            title: "Hóa đơn",
          },
        },
        {
          path: "/medical-records",
          element: <MedicalRecordsPage />,
          handle: {
            back: true,
            title: "Hồ sơ bệnh án",
          },
        },
        {
          path: "/medical-records/new",
          element: <NewMedicalRecordPage />,
          handle: {
            back: true,
            title: "Tạo hồ sơ mới",
          },
        },
        {
          path: "/medical-records/:id",
          element: <MedicalRecordDetailPage />,
          handle: {
            back: true,
            title: "Chi tiết hồ sơ",
          },
        },
        {
          path: "/admin",
          element: <AdminDashboard />,
          handle: {
            back: true,
            title: "Admin Dashboard",
          },
        },
        {
          path: "/qr-test",
          element: <QRTestPage />,
          handle: {
            back: true,
            title: "QR Test",
          },
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
      ErrorBoundary,
    },
  ],
  { basename: getBasePath() }
);

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

export default router;
