import DoctorSelector from "@/components/form/doctor-selector";
import FabForm from "@/components/form/fab-form";
import { bookingFormState } from "@/state";
import { Doctor } from "@/types";
import { useSetAtom } from "jotai";
import { useContext, useState } from "react";
import { useNavigate } from "zmp-ui";
import { DetailPageContext } from "./context";

export default function Tab2() {
  const { tab2 } = useContext(DetailPageContext);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>();
  // Get URL search params
  const queryParams = new URLSearchParams(window.location.search);
  const navigate = useNavigate();
  const setBookingData = useSetAtom(bookingFormState);

  return (
    <FabForm
      fab={{
        children: "Đặt lịch khám",
        onClick: () => {
          setBookingData((prev) => ({
            ...prev,
            department: tab2.department,
            doctor: selectedDoctor,
          }));
          navigate("/booking", {
            viewTransition: true,
          });
        },
      }}
    >
      <DoctorSelector
        value={selectedDoctor}
        onChange={setSelectedDoctor}
        onLoadDoctors={(doctors) => {
          const doctorId = queryParams.get("doctor");
          const doctor = doctors.find((d) => d.id === Number(doctorId));
          if (doctor && !selectedDoctor) {
            setSelectedDoctor(doctor);
          }
        }}
      />
    </FabForm>
  );
}
