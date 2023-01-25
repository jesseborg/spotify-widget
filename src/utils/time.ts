import { roundAccurate } from './math';

export const getTimeData = (value: number | bigint = BigInt(0)) => {
	const timestamp = Number(value);
	const minutes = Math.floor(timestamp / 60000);
	const seconds = roundAccurate((timestamp / 1000) % 60, 3);
	const ms = roundAccurate(seconds - Math.floor(seconds), 3) * 1000;

	return {
		minutes,
		seconds,
		ms
	};
};

export const formatTime = (value: number | bigint = BigInt(0)) => {
	const { minutes, seconds } = getTimeData(value);
	const paddedSeconds = String(Math.floor(seconds)).padStart(2, '0');

	return `${minutes}:${paddedSeconds}`;
};
