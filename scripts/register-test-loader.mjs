import { register } from "node:module";

// Reuse the project's TypeScript compiler: tests need no native transpiler,
// downloaded browser, or localhost listener.
register(new URL("./test-loader.mjs", import.meta.url));
