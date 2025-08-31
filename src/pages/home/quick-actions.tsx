import Section from "@/components/section";
import TransitionLink from "@/components/transition-link";
import book from "@/static/book.svg";
import history from "@/static/history.svg";
import medicalRecord from "@/static/medical-record.svg";
import { To } from "react-router-dom";

interface QuickActionProps {
  to: To;
  icon: string;
  title: string;
  subtitle: string;
}

const QuickAction = ({ icon, title, subtitle, to }: QuickActionProps) => (
  <TransitionLink
    to={to}
    className="flex items-center gap-2 rounded-xl bg-white p-3"
  >
    <img src={icon} className="h-11 w-11" />
    <div className="flex flex-grow flex-col gap-1.5 self-stretch">
      <div className="text-base font-medium">{title}</div>
      <div className="text-xs text-disabled">{subtitle}</div>
    </div>
  </TransitionLink>
);

const QuickActions = () => {
  return (
    <Section className="pt-4 pb-5 grid grid-cols-2 gap-3">
      <QuickAction
        to="/booking/new"
        icon={book}
        title="Đặt lịch khám"
        subtitle="Đặt hẹn điều trị"
      />
      <QuickAction
        to="/schedule"
        icon={history}
        title="Lịch hẹn"
        subtitle="Quản lý lịch đã đặt"
      />
      <QuickAction
        to="/medical-records"
        icon={medicalRecord}
        title="Hồ sơ bệnh án"
        subtitle="Theo dõi điều trị"
      />
      <QuickAction
        to="/profile"
        icon={history} // Using history icon temporarily
        title="Hồ sơ cá nhân"
        subtitle="Thông tin tài khoản"
      />
    </Section>
  );
};

export default QuickActions;
