/** @type {import('prettier').Config} */
module.exports = {
	useTabs: true,
	tabWidth: 2,
	semi: true,
	printWidth: 100,
	singleQuote: true,
	trailingComma: 'none',
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'always',
	endOfLine: 'auto',
	quoteProps: 'consistent',
	plugins: [require('prettier-plugin-tailwindcss')]
};