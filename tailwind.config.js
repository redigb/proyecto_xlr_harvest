/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🎨 PALETA CLASH ROYALE + GRANJAS
      colors: {
        // Colores principales
        primary: {
          DEFAULT: '#2E7D32',
          50: '#E8F5E9',
          100: '#C8E6C9', 
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        // Colores de acento
        accent: {
          sun: {
            DEFAULT: '#F9A825',
            50: '#FFFDE7',
            100: '#FFF9C4',
            200: '#FFF59D',
            300: '#FFF176',
            400: '#FFEE58',
            500: '#FFEB3B',
            600: '#FDD835',
            700: '#FBC02D',
            800: '#F9A825',
            900: '#F57F17',
          },
          soil: {
            DEFAULT: '#C59B6D',
            50: '#FAF5F0',
            100: '#F4EADE',
            200: '#E8D5BD',
            300: '#DDC09C',
            400: '#D1AB7B',
            500: '#C59B6D',
            600: '#B8864D',
          },
          gold: {
            DEFAULT: '#FFD700',
            light: '#FFE44D',
            dark: '#E6C300',
          }
        },
        // Fondos
        darker: '#050810',
        dark: '#0a0e1a',
        card: '#141824',
        'card-hover': '#1a2030',
        muted: '#6b7a8f',
      },

      // 🎯 TIPOGRAFÍA GAMER - NOMBRES CORRECTOS
      fontFamily: {
        'display': ['"Luckiest Guy"', 'cursive'],
        'sans': ['"Rajdhani"', 'system-ui', 'sans-serif'],
        'mono': ['"Orbitron"', 'monospace'],
      },

      // 🎪 BORDER RADIUS ESTILO JUEGO
      borderRadius: {
        'game-sm': '8px',
        'game': '12px',
        'game-md': '16px',
        'game-lg': '20px',
        'game-xl': '24px',
      },

      // 🌈 GRADIENTES PREMIUM - NOMBRES SIMPLES
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 50%, #66BB6A 100%)',
        'gradient-sun': 'linear-gradient(45deg, #F9A825 0%, #FFD54F 50%, #FFECB3 100%)',
        'gradient-gold': 'linear-gradient(45deg, #FFD700 0%, #FFE44D 50%, #FFF176 100%)',
        'gradient-card': 'linear-gradient(145deg, #141824 0%, #1a2030 100%)',
      },

      // 🎭 SOMBRAS - NOMBRES QUE EXISTEN EN TAILWIND
      boxShadow: {
        'game': '0 4px 16px rgba(46, 125, 50, 0.2)',
        'game-lg': '0 8px 32px rgba(46, 125, 50, 0.3)',
        'button': '0 4px 12px rgba(46, 125, 50, 0.3)',
        'button-hover': '0 6px 20px rgba(46, 125, 50, 0.4)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(0, 255, 136, 0.4)',
      },

      // 🎬 ANIMACIONES BÁSICAS - SIN ERRORES
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-up': 'slideInUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',

      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
        '0%': { transform: 'translateX(-30px)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },

      // ⚙️ CONFIGURACIONES ADICIONALES
      backdropBlur: {
        'sm': '4px',
        'md': '8px',
      },
    },
  },
  plugins: [],
}