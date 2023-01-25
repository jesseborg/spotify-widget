export const roundAccurate = (value: number, decimalPlaces: number) =>
	Number(Math.round(Number(value + 'e' + decimalPlaces)) + 'e-' + decimalPlaces);
