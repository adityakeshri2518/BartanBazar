/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        premium: "#24342f",
        premiumSoft: "#f7f3ec",
        gold: "#b9945b",
        porcelain: "#fbfaf7",
        flipblue: "#2874f0",
        flipblueDark: "#0b5ed7",
        flipyellow: "#ffe500",
        offergreen: "#388e3c",
        saffron: "#f47c20",
        brass: "#b8892f",
        copper: "#b85c38",
        leaf: "#1f7a4d",
        ink: "#111827"
      },
      boxShadow: {
        glow: "0 22px 60px rgba(40, 116, 240, 0.2)"
      }
    }
  },
  plugins: []
};
