import type { Config } from "tailwindcss";
 
 
 
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1500px',
        'xl-plus': '1201px',
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
          outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        grayCustom: '#fff',
      },
    },  
  },
  plugins: [],
};
 
export default config;
 
 