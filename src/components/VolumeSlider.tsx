import { useRef, useState } from 'react';
import { useMouseWheel } from '../hooks/useMouseWheel';
import { rspc } from '../utils/rspc';
import { Slider } from './base/Slider';

const STEP = 5 / 100;

export const VolumeSliderSkeletonLoader = () => {
	return <span className="block h-full w-2 animate-pulse rounded-full bg-theme-700 duration-200" />;
};

export const VolumeSlider = () => {
	const { mutateAsync: invokeMethod } = rspc.useMutation('media.invokeMethod');

	const ref = useRef<HTMLSpanElement | null>(null);

	const [volume, setVolume] = useState(0);

	useMouseWheel(
		ref,
		{
			// delta: 100 || -100
			onChange: (delta) => {
				commitValue(volume + STEP * (delta / -Math.abs(delta)));
			}
		},
		[volume]
	);

	rspc.useQuery(['media.getVolume'], { onSuccess: setVolume });
	rspc.useSubscription(['media.volumeChanged'], { onData: setVolume });

	const handleValueChange = async (value: number) => {
		commitValue(value);
	};

	const commitValue = async (value: number) => {
		const volume = Math.max(0, Math.min(1, value));
		setVolume(volume);
		invokeMethod({ setVolume: volume });
	};

	if (volume < 0) {
		return <VolumeSliderSkeletonLoader />;
	}

	return (
		<div className="relative h-full w-1">
			<Slider
				ref={ref}
				value={[volume]}
				max={1}
				className="absolute left-1/2 -translate-x-1/2"
				step={STEP}
				onValueChange={(value) => handleValueChange(value[0])}
				orientation="vertical"
			/>
		</div>
	);
};
