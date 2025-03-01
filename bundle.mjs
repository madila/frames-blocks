import esbuild from "esbuild";

esbuild
    .build({
        entryPoints: ["src/styles/frames-blocks.css", "src/client/index.ts"],
        outdir: "dist/js/client",
        bundle: true,
        plugins: [],
    })
    .then(() => console.log("⚡ Build complete! ⚡"))
    .catch(() => process.exit(1));
