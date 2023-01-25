import { TailwindShade } from './bindings';

// TODO: Maybe also add the hexcode
export const defaultShades = [
	{ number: '50', rgb: [255, 255, 255] },
	{ number: '100', rgb: [239, 239, 239] },
	{ number: '200', rgb: [220, 220, 220] },
	{ number: '300', rgb: [189, 189, 189] },
	{ number: '400', rgb: [152, 152, 152] },
	{ number: '500', rgb: [124, 124, 124] },
	{ number: '600', rgb: [101, 101, 101] },
	{ number: '700', rgb: [82, 82, 82] },
	{ number: '800', rgb: [70, 70, 70] },
	{ number: '900', rgb: [61, 61, 61] }
] as TailwindShade[];

export const updateTheme = (
	shades: Array<TailwindShade> = defaultShades,
	prominantColor: [number, number, number] = [255, 255, 255]
) => {
	shades.map(({ rgb, number }) => {
		document.documentElement.style.setProperty(
			`--theme-${number}`,
			`${rgb[0]} ${rgb[1]} ${rgb[2]}`
		);
	});

	document.documentElement.style.setProperty(
		'--theme-prominant',
		`${prominantColor[0]} ${prominantColor[1]} ${prominantColor[2]}`
	);
};
