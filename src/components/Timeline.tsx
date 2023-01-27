import { FC, HTMLAttributes, useState } from 'react';
import { MediaTimelineData } from '../utils/bindings';
import { clsx } from '../utils/clsx';
import { formatTime } from '../utils/time';
import { PropsWithLoading } from '../utils/types';
import { Slider } from './base/Slider';

type TimelineProps = {
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

export const Timeline: FC<PropsWithLoading<TimelineProps>> = ({ data, isPlaying, loading }) => {
	const timelinePosition = Number(data?.timelinePosition ?? 0) / 10000;
	const timelineEndTime = Number(data?.timelineEndTime ?? 0) / 10000;

	const [sliderPosition, setSliderPosition] = useState(timelinePosition);
	const timelinePositionPercent = (sliderPosition / timelineEndTime) * 100;

	const [isDragging, setIsDragging] = useState(false);

	const handleValueChange = (value: number[]) => {
		setIsDragging(true);
		// console.log(value);

		setSliderPosition(value[0]);
	};

	const handleValueCommit = (value: number[]) => {
		setIsDragging(false);
		// emit event to backend
	};

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
				<FormattedTime
					style={{
						left: `${timelinePositionPercent}%`,
						transform: `translateX(-${timelinePositionPercent}%)`
					}}
					className={clsx('absolute -top-1/2 opacity-0 transition-all', {
						'opacity-100 transition-none': isDragging
					})}
					value={sliderPosition}
				/>
				<Slider
					value={[isDragging ? sliderPosition : timelinePosition]}
					max={timelineEndTime}
					onValueChange={handleValueChange}
					onValueCommit={handleValueCommit}
				/>
			</span>
		</div>
	);
};
