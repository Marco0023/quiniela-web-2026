import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        pitch: "#07120e",
        turf: "#0e2b22",
        emeraldGlow: "#22c55e",
        gold: "#f4c95d",
        ink: "#e8fff5"
      },
      boxShadow: {
        glow: "0 0 60px rgba(34, 197, 94, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
