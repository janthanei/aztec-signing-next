import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      dark: {
        colors: {
          background: "#0D0D0D",
          foreground: "#ECEDEE",
          primary: {
            50: "#E4D7FF",
            100: "#C8B3FE",
            200: "#AC8FFD",
            300: "#906BFC",
            400: "#7447FB",
            500: "#5820FA",
            600: "#4619C8",
            700: "#351396",
            800: "#240D64",
            900: "#120632",
            DEFAULT: "#5820FA",
            foreground: "#FFFFFF",
          },
          focus: "#5820FA",
        },
      },
    },
  })],
}

export default config;