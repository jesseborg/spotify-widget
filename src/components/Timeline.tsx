import { FC, HTMLAttributes, useEffect, useState } from 'react';
import { MediaTimelineData } from '../utils/bindings';
import { clsx } from '../utils/clsx';
import { rspc } from '../utils/rspc';
import { formatTime } from '../utils/time';
import { Slider } from './base/Slider';

type TimelineProps = {
	data?: MediaTimelineData | null;
	isPlaying?: boolean;
};

type FormattedTimeProps = {
	value: number;
	hide?: boolean;
};

const FormattedTime: FC<FormattedTimeProps & HTMLAttributes<HTMLParagraphElement>> = ({
	value = 0,
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

export const Timeline: FC<TimelineProps> = ({ data }) => {
	const { mutateAsync: invokeMethod } = rspc.useMutation('media.invokeMethod');

	const [timelinePosition, setTimelinePosition] = useState(Number(data?.timelinePosition ?? 0));
	const timelineEndTime = Number(data?.timelineEndTime ?? 0);

	const [sliderPosition, setSliderPosition] = useState(timelinePosition);
	const timelinePositionPercent = (sliderPosition / timelineEndTime) * 100;

	const [isDragging, setIsDragging] = useState(false);

	const handleValueChange = (value: number) => {
		setIsDragging(true);
		setSliderPosition(value);
	};

	const handleValueCommit = async (value: number) => {
		setIsDragging(false);
		setSliderPosition(value);
		setTimelinePosition(value);

		await invokeMethod({ setPlaybackPosition: value });
	};

	useEffect(() => {
		setTimelinePosition(Number(data?.timelinePosition ?? 0));
	}, [data?.timelinePosition]);

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
					className={clsx('absolute -top-1/2 transition-all', {
						'transition-none': isDragging
					})}
					value={sliderPosition}
					hide={!isDragging}
				/>
				<Slider
					value={[isDragging ? sliderPosition : timelinePosition]}
					max={timelineEndTime}
					onValueChange={([value]) => handleValueChange(value)}
					onValueCommit={([value]) => handleValueCommit(value)}
				/>
			</span>
		</div>
	);
};
