import Header from "./header";
import Footer from "./footer";
import HomeButton from "./home-button";
import { Toaster } from "react-hot-toast";
import { ScrollRestoration } from "./scroll-restoration";
import Page from "./page";
import { useLocation } from "zmp-ui";

export default function Layout() {
  const location = useLocation();
  const showHomeButton = location.pathname !== "/";

  return (
    <div className="w-screen h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header />
      <Page />
      <Footer />
      {showHomeButton && <HomeButton />}
      <Toaster containerClassName="toast-container" position="bottom-center" />
      <ScrollRestoration />
    </div>
  );
}
