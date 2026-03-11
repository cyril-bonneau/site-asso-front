import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Tailwind CSS v4 via plugin Vite (remplace le workflow postcss classique)
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias "@/" pointe vers "src/" pour des imports plus propres
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
