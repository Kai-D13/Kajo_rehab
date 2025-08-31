// React core
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// Router
import router from "@/router";

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
  console.warn('� Unhandled promise rejection caught:', event.reason);
  // Don't crash the app on production  
  event.preventDefault();
});

// DISABLE problematic services in production
// Services causing GoTrueClient errors are disabled
console.log('🚀 KajoTai Mini App starting... (Production Mode)');

// Mount the app
const root = createRoot(document.getElementById("app")!);
root.render(createElement(RouterProvider, { router }));
