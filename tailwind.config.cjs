/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				satoshi: ['Satoshi', 'sans-serif']
			},
			colors: {
				theme: {
					50: 'rgb(var(--theme-50) / <alpha-value>)',
					100: 'rgb(var(--theme-100) / <alpha-value>)',
					200: 'rgb(var(--theme-200) / <alpha-value>)',
					300: 'rgb(var(--theme-300) / <alpha-value>)',
					400: 'rgb(var(--theme-400) / <alpha-value>)',
					500: 'rgb(var(--theme-500) / <alpha-value>)',
					600: 'rgb(var(--theme-600) / <alpha-value>)',
					700: 'rgb(var(--theme-700) / <alpha-value>)',
					800: 'rgb(var(--theme-800) / <alpha-value>)',
					900: 'rgb(var(--theme-900) / <alpha-value>)',
					prominant: 'rgb(var(--theme-prominant) / <alpha-value>)'
				},
				spotify: {
					green: '#1ed760',
					thumbnail: {
						blue: '#3f12b8',
						green: '#7b9287'
					}
				}
			},
			keyframes: {
				slideIn: {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				slideOut: {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(100%)' }
				}
			},
			animation: {
				'slide-in': 'slideIn 150ms normal cubic-bezier(0.4, 0, 0.2, 1) forwards',
				'slide-out': 'slideOut 150ms normal cubic-bezier(0.4, 0, 0.2, 1) forwards'
			}
		}
	},
	plugins: []
};
