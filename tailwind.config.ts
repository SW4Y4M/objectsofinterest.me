import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wall: "#f8f7f4",
        ink: "#1c1b19",
        muted: "#6f6a62",
        line: "#ddd7cd",
        label: "#fffdfa"
      },
      boxShadow: {
        label: "0 18px 44px rgba(28, 27, 25, 0.14)"
      }
    }
  }
};

export default config;
