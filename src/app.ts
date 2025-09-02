// React core
import { createElement } from "react";
import { createRoot } from "react-dom/client";

// ZMP Router App
import RouterApp from "@/router-app";

// ZaUI stylesheet
import "zmp-ui/zaui.min.css";
// Tailwind stylesheet
import "@/css/tailwind.scss";
// Your stylesheet
import "@/css/app.scss";

// Expose app configuration
import appConfig from "../app-config.json";

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig;
}

// Production error handling
window.addEventListener('error', (event) => {
  console.warn('🟡 Production error caught:', event.error?.message || 'Unknown error');
  // Don't crash the app on production
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('🔄 Unhandled promise rejection caught:', event.reason);
  // Don't crash the app on production  
  event.preventDefault();
});

console.log('🚀 KajoTai Mini App starting... (ZMP Router Mode)');

// Mount the app with ZMP Router
const root = createRoot(document.getElementById("app")!);
root.render(createElement(RouterApp));
