import DoctorItem from "@/components/items/doctor";
import TransitionLink from "@/components/transition-link";
import { Booking } from "@/types";
import {
  formatDayName,
  formatFullDate,
  formatShortDate,
  formatTimeSlot,
} from "@/utils/format";

export interface ScheduleItemProps {
  schedule: Booking;
}

export function ScheduleItem({ schedule }: ScheduleItemProps) {
  // Determine status display and color
  const getStatusDisplay = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return { text: 'Đã xác nhận', color: 'text-green-600' };
      case 'pending': return { text: 'Chờ xác nhận', color: 'text-orange-600' };
      case 'cancelled': return { text: 'Đã hủy', color: 'text-red-600' };
      case 'completed': return { text: 'Hoàn thành', color: 'text-blue-600' };
      default: return { text: status || 'Chờ xác nhận', color: 'text-gray-600' };
    }
  };

  const statusInfo = getStatusDisplay(schedule.status);

  return (
    <TransitionLink
      to={`/schedule/${schedule.id}`}
      className="flex w-full flex-col gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between gap-11 font-medium">
        <div className="text-base">{schedule.department.name}</div>
        <div className={`text-xs font-semibold ${statusInfo.color}`}>
          {statusInfo.text}
        </div>
      </div>
      <hr className="border-t border-black/10" />
      <DoctorItem doctor={schedule.doctor} />
      
      {/* Enhanced booking information display */}
      <div className="text-sm space-y-2">
        <div>
          <p className="font-medium">Thông tin bệnh nhân: {schedule.patientName}</p>
          <p className="text-gray-600">
            {formatDayName(schedule.schedule.date)}{" "}
            {formatTimeSlot(schedule.schedule.time)} - {formatFullDate(schedule.schedule.date)}
          </p>
        </div>
        
        {/* Display symptoms and description if available */}
        {(schedule as any).symptoms && (
          <div className="bg-gray-50 p-2 rounded-md">
            <p className="font-medium text-gray-700 text-xs">Triệu chứng:</p>
            <p className="text-gray-600 text-xs">{(schedule as any).symptoms}</p>
          </div>
        )}
        
        {(schedule as any).detailed_description && (
          <div className="bg-blue-50 p-2 rounded-md">
            <p className="font-medium text-blue-700 text-xs">Mô tả chi tiết:</p>
            <p className="text-blue-600 text-xs">{(schedule as any).detailed_description}</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-gray-500">
          ID: {schedule.id?.substring(0, 8)}...
        </div>
        <div className="rounded-md bg-highlight px-2 py-1.5 text-primary text-xs">
          Xem chi tiết
        </div>
      </div>
    </TransitionLink>
  );
}
