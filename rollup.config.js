import typescript from '@rollup/plugin-typescript';

export default {
    // NOTE: To debug sheet accessor only, please use the below entrypoint.
    input: "./test/calendar_event_creator_debug.ts",
    // input: "./src/main.ts",
    output: {
        dir: "build",
        format: "cjs",
        sourcemap: true,
    },
    // NOTE: Disable treeshaking to keep functions.
    treeshake: false,
    plugins: [typescript()],
};
