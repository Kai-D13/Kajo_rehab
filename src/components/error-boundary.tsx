import NotFound from "@/pages/404";
import { AuthService } from "@/services/auth.service";
import { NotifiableError } from "@/utils/errors";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    if (error instanceof NotifiableError) {
      toast.error(error.message);
      // Clear any auth data if needed
      if (error.message.includes("auth") || error.message.includes("user")) {
        // Could add logout logic here if needed
      }
    } else {
      console.warn({ error });
    }
  }, [error]);

  return <NotFound noToast />;
}
