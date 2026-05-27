import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dock: {
          background: "var(--background)",
          foreground: "var(--foreground)",
          muted: "var(--muted)",
          line: "var(--line)",
        },
      },
    },
  },
};

export default config;
