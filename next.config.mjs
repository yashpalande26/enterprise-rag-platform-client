import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin workspace root so Next doesn't pick ~/package-lock.json (fixes warning + bad root bugs).
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config) => {
    // Next's client `resolve.fallback.util` can break `source-map-js` (PostCSS maps / Tailwind v4).
    // Disabling PostCSS loader source maps avoids that code path.
    const setPostcssNoSourceMap = (rules) => {
      for (const rule of rules) {
        if (rule.oneOf) setPostcssNoSourceMap(rule.oneOf);
        const uses = rule.use;
        if (!uses) continue;
        const list = Array.isArray(uses) ? uses : [uses];
        for (const entry of list) {
          const loader = typeof entry === "string" ? entry : entry?.loader;
          if (loader && loader.includes("postcss-loader")) {
            const use = typeof entry === "object" ? entry : { loader: entry };
            use.options = { ...use.options, sourceMap: false };
          }
        }
      }
    };
    setPostcssNoSourceMap(config.module.rules);
    return config;
  },
};

export default nextConfig;
