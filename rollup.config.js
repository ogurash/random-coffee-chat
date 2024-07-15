import typescript from '@rollup/plugin-typescript';

export default {
    // NOTE: To debug sheet accessor only, please use the below entrypoint.
    // input: "./test/sheets_accessor_debug.ts",
    input: "./src/main.ts",
    output: {
        dir: "build",
        format: "cjs",
        sourcemap: true,
    },
    plugins: [typescript()],
};
