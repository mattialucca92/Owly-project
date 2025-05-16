import { defineConfig } from "vite";
export default {
  base: "./", // Usa percorsi relativi invece di assoluti
  build: {
    outDir: "dist",
  },
  css: {
    preprocessorOptions: {
      // altre configurazioni
    },
    optimizeDeps: {
    include: ['normalize.css']
  }
  },
};
