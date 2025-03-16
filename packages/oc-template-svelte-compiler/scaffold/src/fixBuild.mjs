import fs from "node:fs";

/**
 * Temporary fix for the svelte vite plugin to make it work with CJS
 */

const path = "./node_modules/@sveltejs/vite-plugin-svelte/package.json";

const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
pkg.exports["."].node = pkg.exports["."].import;

fs.writeFileSync(path, JSON.stringify(pkg, null, 2), "utf8");
