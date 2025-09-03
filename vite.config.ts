import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "src/manifest.json",
          dest: ".",
        },
      ],
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/popup.html"),
        "apple-music-player": resolve(__dirname, "src/apple-music/player.html"),
        background: resolve(__dirname, "src/background/background.ts"),
        "content-youtube": resolve(
          __dirname,
          "src/content/youtube-detector.ts",
        ),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "styles/[name][extname]";
          }
          if (assetInfo.name?.endsWith(".html")) {
            return "[name][extname]";
          }
          return "[name][extname]";
        },
        format: "es", // Use ES modules
      },
    },
    minify: false, // Keep readable for debugging
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development",
    ),
  },
});
