import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 con plugin Vite nativo
  ],

  // Server config per sviluppo
  server: {
    host: true, // Accesso da dispositivi mobili nella rete locale
    port: 3000, // Porta fissa per consistency
    open: true, // Apri automaticamente il browser
  },

  // Build config per production
  build: {
    outDir: "dist", // Capacitor richiede 'dist' come output directory
    sourcemap: true, // Source maps per debugging in production
    minify: "esbuild", // Minificazione veloce
    target: "esnext", // Target moderno per performance
  },

  // Fix per librerie che usano 'global'
  define: {
    global: "globalThis",
  },

  // Ottimizzazioni per mobile development
  optimizeDeps: {
    include: ["@ionic/react", "@ionic/core", "daily-js"],
  },

  // Risoluzione alias per import più puliti (opzionale)
  resolve: {
    alias: {
      "@": "/src", // Permette import come "@/components/..."
    },
  },
});
