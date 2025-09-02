import { defineConfig, loadEnv } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [zaloMiniApp(), react()],
    build: {
      assetsInlineLimit: 0,
      target: "es2015",
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    // Make sure environment variables are available
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.VITE_SUPABASE_SERVICE_ROLE_KEY),
      'import.meta.env.VITE_ZALO_OA_ACCESS_TOKEN': JSON.stringify(env.VITE_ZALO_OA_ACCESS_TOKEN),
      'import.meta.env.VITE_ZALO_OA_ID': JSON.stringify(env.VITE_ZALO_OA_ID),
      'import.meta.env.VITE_ZALO_MINI_APP_ID': JSON.stringify(env.VITE_ZALO_MINI_APP_ID),
      'import.meta.env.VITE_ZALO_MINI_APP_SECRET': JSON.stringify(env.VITE_ZALO_MINI_APP_SECRET),
    },
  });
};
