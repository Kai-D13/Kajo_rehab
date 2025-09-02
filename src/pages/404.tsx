import { useEffect } from "react";
import { useNavigate } from "zmp-ui";
import toast from "react-hot-toast";

export default function NotFound(props: { noToast?: boolean }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!props.noToast) {
      toast.error("Trang không tồn tại");
    }
    navigate(-1);
  }, []);
  return <></>;
}
