import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        tamak: {
          navy: "#1F3864",
          gold: "#C9962C",
          dark: "#222222",
          light: "#F7F7F7",
        },
      },
    },
  },
  plugins: [],
};
export default config;
