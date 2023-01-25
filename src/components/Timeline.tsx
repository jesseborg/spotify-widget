import { FC, HTMLAttributes, useEffect, useState } from 'react';
import { MediaTimelineData } from '../utils/bindings';
import { clsx } from '../utils/clsx';
import { formatTime } from '../utils/time';
import { PropsWithLoading } from '../utils/types';
import { Slider } from './base/Slider';

type Props = {
	data?: MediaTimelineData | null;
	isPlaying?: boolean;
};

type FormattedTimeProps = {
	value?: number;
	hide?: boolean;
};

const FormattedTime: FC<FormattedTimeProps & HTMLAttributes<HTMLParagraphElement>> = ({
	value,
	hide,
	className,
	...props
}) => {
	return (
		<p
			className={clsx('flex-1 transition-all duration-200', className, {
				'opacity-0': hide
			})}
			{...props}
		>
			{formatTime(value)}
		</p>
	);
};

export const Timeline: FC<PropsWithLoading<Props>> = ({ data, isPlaying, loading }) => {
	const [timelinePosition, setTimelinePosition] = useState(
		Number(data?.timelinePosition ?? 0) / 10000
	);
	const timelineEndTime = Number(data?.timelineEndTime ?? 0) / 10000;
	const timelinePositionPercent = (timelinePosition / timelineEndTime) * 100;

	const [isDragging, setIsDragging] = useState(false);

	const handleValueChange = (value: number[]) => {
		setIsDragging(true);
		// console.log(value);

		setTimelinePosition(value[0]);
	};

	const handleValueCommit = (value: number[]) => {
		setIsDragging(false);
		// emit event to backend
	};

	useEffect(() => {
		if (isDragging) {
			return;
		}

		setTimelinePosition(Number(data?.timelinePosition ?? 0) / 10000);
	}, [data?.timelinePosition]);

	// const [timelinePosition, setTimelinePosition] = useState(
	// 	Number(data?.timelinePosition ?? 0) / 10000
	// );

	// useEffect(() => {
	// 	let currentPosition = Number(data?.timelinePosition ?? 0) / 10000;
	// 	let { ms } = getTimeData(currentPosition);

	// 	const updateTime = (diff: number = 0) => {
	// 		if (!isPlaying || Number(data?.timelineEndTime) === 0) {
	// 			setTimelinePosition(currentPosition);
	// 			return;
	// 		}

	// 		if (diff) {
	// 			console.log(diff, 1000 - diff);
	// 		}

	// 		setTimelinePosition((currentPosition += 1000 - diff));
	// 	};

	// 	// Round up to the next second
	// 	updateTime(1000 - ms);
	// 	const timer = setInterval(updateTime, 1000);

	// 	if (!isPlaying || Number(data?.timelineEndTime) === 0) {
	// 		clearInterval(timer);
	// 		return;
	// 	}

	// 	return () => {
	// 		clearInterval(timer);
	// 	};
	// }, [data, isPlaying]);

	if (loading) {
		return (
			<span className="absolute bottom-0 block h-2 w-full animate-pulse rounded-full bg-theme-200 duration-200" />
		);
	}

	return (
		<div className="pointer-events-auto flex flex-1 flex-col gap-1 text-[10px] text-theme-100">
			<div className="flex h-[10px] items-center">
				<FormattedTime
					value={timelinePosition}
					hide={isDragging && timelinePositionPercent <= 10}
				/>
				<FormattedTime
					className="text-right"
					value={timelineEndTime}
					hide={isDragging && timelinePositionPercent >= 90}
				/>
			</div>
			<span className="flex h-1 items-center">
				{isDragging && (
					<FormattedTime
						style={{
							left: `calc(${timelinePositionPercent}%)`,
							transform: `translateX(-${timelinePositionPercent}%)`
						}}
						className={clsx('absolute -top-1/2 transition-all', {
							'transition-none': isDragging
						})}
						value={timelinePosition}
					/>
				)}
				<Slider
					value={[timelinePosition]}
					max={timelineEndTime}
					onValueChange={handleValueChange}
					onValueCommit={handleValueCommit}
				/>
			</span>
		</div>
	);
};
