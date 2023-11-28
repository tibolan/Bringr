import {fileURLToPath, URL} from 'node:url'
import path from 'node:path';
import {defineConfig, loadEnv } from 'vite'
import vue from "@vitejs/plugin-vue2"
import dts from 'vite-plugin-dts';
import typescript2 from 'rollup-plugin-typescript2';
// import nightwatchPlugin from 'vite-plugin-nightwatch'


// https://vitejs.dev/config/

export default defineConfig(({command, mode, ssrBuild}) => {
    return {
        define: {

        },
        build: {
            manifest: true,
            ssrManifest: false,
            cssCodeSplit: false,
            reportCompressedSize: true,
            cssMinify: true,
            outDir: "pub",
            lib: {
                // Could also be a dictionary or array of multiple entry points
                entry: "src/index.ts",
                name: 'Bringr',
                fileName: format => `Bringr.${format}.js`
            },
            rollupOptions: {
                // make sure to externalize deps that should not be bundled
                // into your library
                input: {
                    main: path.resolve(__dirname, "src/index.ts")
                },
                output: {
                    exports: "named"
                },
            },
        },

        plugins: [
            dts({
                insertTypesEntry: true,
            }),
            typescript2({
                check: true,
                include: ["src/index.ts"],
                tsconfigOverride: {
                    compilerOptions: {
                        outDir: "pub",
                        sourceMap: true,
                        declaration: true,
                        declarationMap: true,
                    },
                },
                exclude: ["vite.config.ts"],
            })
            // nightwatchPlugin(),
        ]
    }
})
