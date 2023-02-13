import { TailwindShade } from './bindings';

export const defaultShades = [
	{ number: '50', rgb: [244, 245, 250] },
	{ number: '100', rgb: [229, 229, 244] },
	{ number: '200', rgb: [209, 210, 236] },
	{ number: '300', rgb: [177, 180, 223] },
	{ number: '400', rgb: [139, 142, 207] },
	{ number: '500', rgb: [114, 112, 193] },
	{ number: '600', rgb: [101, 93, 179] },
	{ number: '700', rgb: [92, 80, 160] },
	{ number: '800', rgb: [82, 71, 134] },
	{ number: '900', rgb: [67, 60, 108] }
] as TailwindShade[];

export const updateTheme = (
	shades: Array<TailwindShade> = defaultShades,
	prominantColor: [number, number, number] = [92, 80, 160],
	averageColor: [number, number, number] = [92, 80, 160]
) => {
	shades.map(({ rgb, number }) =>
		document.documentElement.style.setProperty(`--theme-${number}`, `${rgb.join(' ')}`)
	);
	document.documentElement.style.setProperty('--theme-prominant', `${prominantColor.join(' ')}`);
	document.documentElement.style.setProperty('--theme-average', `${averageColor.join(' ')}`);
};

export const resetTheme = () => updateTheme();
