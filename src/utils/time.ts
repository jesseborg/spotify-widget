import { roundAccurate } from './math';

export const getTimeData = (value: number) => {
	const timestamp = Number(value) / 10000;
	const minutes = Math.floor(timestamp / 60000);
	const seconds = roundAccurate((timestamp / 1000) % 60, 3);
	const ms = roundAccurate(seconds - Math.floor(seconds), 3) * 1000;

	return {
		minutes,
		seconds,
		ms
	};
};

export const formatTime = (value: number) => {
	const { minutes, seconds } = getTimeData(value);
	const paddedSeconds = String(Math.floor(seconds)).padStart(2, '0');

	return `${minutes}:${paddedSeconds}`;
};
