import DateTimePicker from "@/components/form/date-time-picker";
import DoctorSelector from "@/components/form/doctor-selector";
import DepartmentPicker from "@/components/form/department-picker";
import FabForm from "@/components/form/fab-form";
import { bookingFormState } from "@/state";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate } from "zmp-ui";
import { TimeSlot, AvailableTimeSlots } from "@/types";
import toast from "react-hot-toast";
import { mock7DaysTimeSlots } from "@/utils/mock";
import { Page, Box, Text, Spinner } from "zmp-ui";

export default function Step1() {
  const [timeSlots, setTimeSlots] = useState<AvailableTimeSlots[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useAtom(bookingFormState);
  const [selectedSlot, setSelectedSlot] = useState<Partial<TimeSlot>>(
    formData.slot ?? {}
  );
  const navigate = useNavigate();

  useEffect(() => {
    // Load time slots safely without Suspense
    const loadTimeSlots = async () => {
      try {
        const slots = await mock7DaysTimeSlots();
        setTimeSlots(slots);
      } catch (error) {
        console.error('Error loading time slots:', error);
        toast.error('Không thể tải lịch trống. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeSlots();
  }, []);

  useEffect(() => {
    if (selectedSlot) {
      const { date, time } = selectedSlot;
      if (date && time) {
        setFormData((prev) => ({
          ...prev,
          slot: { date, time },
        }));
      }
    }
  }, [selectedSlot, setFormData]);

  if (isLoading) {
    return (
      <Page>
        <Box className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Spinner visible />
            <Text className="mt-4">Đang tải thông tin đặt lịch...</Text>
          </div>
        </Box>
      </Page>
    );
  }

  return (
    <FabForm
      fab={{
        children: "Tiếp tục",
        disabled: !formData.slot || !formData.department || !formData.doctor,
        onClick: () => {
          navigate("/booking/2", {
            viewTransition: true,
          });
        },
        onDisabledClick() {
          toast.error("Vui lòng điền đầy đủ thông tin!");
        },
      }}
    >
      <div className="bg-white flex flex-col space-y-1">
        <div className="p-4">
          <DepartmentPicker
            label="Khoa khám"
            placeholder="Chọn khoa khám"
            value={formData?.department}
            onChange={(department) =>
              setFormData((prev) => ({
                ...prev,
                department,
              }))
            }
          />
        </div>
        <DateTimePicker
          value={selectedSlot}
          onChange={setSelectedSlot}
          slots={timeSlots}
        />
      </div>
      <DoctorSelector
        value={formData?.doctor}
        onChange={(doctor) =>
          setFormData((prev) => ({
            ...prev,
            doctor,
          }))
        }
      />
    </FabForm>
  );
}
