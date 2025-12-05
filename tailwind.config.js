module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'boutique-gradient': 'radial-gradient(circle at top, #ffe4ef 0, #fef3c7 35%, #ecfeff 100%)'
      }
    }
  },
  plugins: []
};
