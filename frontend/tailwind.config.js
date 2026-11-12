/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        mangaluru: {
          blue: "#0284c7",
          dark: "#0f172a",
          teal: "#0d9488",
          sky: "#0284c7",
          accent: "#38bdf8",
        }
      },
    },
  },
  plugins: [],
};
