import { defineConfig } from "vite";

export default defineConfig({
    base: "/minecraft_old_SJU/",
    build: {
        outDir: "dist",
        assetsDir: "assets",
        sourcemap: false,
        minify: "esbuild",
    },
    server: {
        open: true,
    },
});
