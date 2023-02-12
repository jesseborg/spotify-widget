import { FC, HTMLAttributes, KeyboardEvent, useEffect, useState } from 'react';
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
	const [timeSinceLastKey, setTimeSinceLastKey] = useState(0);

	const handleValueChange = (value: number) => {
		setIsDragging(true);
		setSliderPosition(value);
	};

	const commitValue = async (value: number, invoke = true) => {
		setSliderPosition(value);
		setTimelinePosition(value);

		if (invoke) {
			setIsDragging(false);
			await invokeMethod({ setPlaybackPosition: value });
		}
	};

	const handleValueCommit = async (value: number) => {
		commitValue(value);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
		if (Date.now() - timeSinceLastKey < 100) {
			event.preventDefault();
			return;
		}

		if (event.key === 'Escape' && isDragging) {
			commitValue(timelinePosition, false);
		}

		setTimeSinceLastKey(Date.now());
	};

	const handleKeyUp = (_: KeyboardEvent<HTMLSpanElement>) => {
		setIsDragging(false);
	};

	useEffect(() => {
		setTimelinePosition(Number(data?.timelinePosition ?? 0));
	}, [data?.timelinePosition]);

	return (
		<div className="flex flex-1 flex-col gap-1 text-[10px]">
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
			<span className="pointer-events-auto flex h-1 items-center">
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
					step={10000000}
					onValueChange={([value]) => handleValueChange(value)}
					onValueCommit={([value]) => handleValueCommit(value)}
					onKeyDown={handleKeyDown}
					onKeyUp={handleKeyUp}
				/>
			</span>
		</div>
	);
};
