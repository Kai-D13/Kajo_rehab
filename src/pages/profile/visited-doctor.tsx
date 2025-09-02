import { bookingFormState } from "@/state";
import { Doctor } from "@/types";
import { useSetAtom } from "jotai";
import { useNavigate } from "zmp-ui";

interface VisitedDoctorProps {
  doctor: Doctor;
}

export function VisitedDoctor({ doctor }: VisitedDoctorProps) {
  const setFormData = useSetAtom(bookingFormState);
  const navigate = useNavigate();

  // Guard against undefined doctor
  if (!doctor) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-[#F6F8FC] px-3 py-2 text-left">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="flex flex-grow flex-col gap-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <button
      className="flex items-center gap-2 rounded-lg bg-[#F6F8FC] px-3 py-2 text-left"
      onClick={() => {
        setFormData((prev) => ({
          ...prev,
          doctor,
        }));
        navigate("/booking", {
          viewTransition: true,
        });
      }}
    >
      <img 
        src={doctor.image || '/static/doctors/default-avatar.png'} 
        className="w-10 h-10 rounded-full object-cover" 
        alt={doctor.name}
      />
      <div className="flex flex-grow flex-col gap-2">
        <div className="text-sm font-medium">{doctor.name}</div>
        <div className="flex items-start text-disabled text-2xs">
          {doctor.specialties}
        </div>
      </div>
    </button>
  );
}
