import { DashedDivider } from "@/components/dashed-divider";
import FabForm from "@/components/form/fab-form";
import SuccessIcon from "@/components/icons/success";
import PolarizedList from "@/components/polarized-list";
import { useAtomValue } from "jotai";
import { useNavigate } from "zmp-ui";
import { bookingFormState } from "@/state";
import { AuthService } from "@/services/auth.service";
import { formatShortDate, formatTimeSlot } from "@/utils/format";

export default function Step3() {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();
  const formData = useAtomValue(bookingFormState);

  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center">Loading user data...</div>
      </div>
    );
  }

  return (
    <FabForm
      fab={{
        children: "Xem lịch hẹn của tôi",
        onClick: () => {
          navigate("/schedule", {
            viewTransition: true,
          });
        },
      }}
    >
      <div className="p-4 h-full flex items-center">
        <div className="flex w-full flex-col items-center gap-4 rounded-2xl bg-white px-4 py-8">
          <SuccessIcon />
          <div className="self-stretch text-center text-lg font-medium">
            Đặt lịch thành công
          </div>
          <DashedDivider />
          <PolarizedList
            items={[
              ["Tên", user.name],
              formData.department && ["Khoa", formData.department.name],
              formData.doctor && ["Bác sĩ", formData.doctor.name],
              formData.slot && [
                "Thời gian khám bệnh",
                `${formatShortDate(formData.slot.date)} ${formatTimeSlot(formData.slot.time)}`,
              ],
              formData.symptoms.length > 0 && [
                "Triệu chứng",
                formData.symptoms.join(", "),
              ],
              formData.description.trim().length > 0 && [
                "Mô tả",
                formData.description,
              ],
            ]}
          />
        </div>
      </div>
    </FabForm>
  );
}
