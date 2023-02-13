import { useState } from 'react';
import { rspc } from '../utils/rspc';
import { Slider } from './base/Slider';

export const VolumeSliderSkeletonLoader = () => {
	return <span className="block h-full w-2 animate-pulse rounded-full bg-theme-700 duration-200" />;
};

export const VolumeSlider = () => {
	const { mutateAsync: invokeMethod } = rspc.useMutation('media.invokeMethod');

	const [volume, setVolume] = useState(0);

	rspc.useQuery(['media.getVolume'], {
		onSuccess: (volume) => setVolume(volume * 100)
	});
	rspc.useSubscription(['media.volumeChanged'], {
		onData: (volume) => setVolume(volume * 100)
	});

	const handleValueChange = async (value: number) => {
		setVolume(value);

		await invokeMethod({ setVolume: Math.max(0, Math.min(100, value)) / 100 });
	};

	if (volume < 0) {
		return <VolumeSliderSkeletonLoader />;
	}

	return (
		<div className="relative h-full w-1">
			<Slider
				value={[volume]}
				className="absolute left-1/2 -translate-x-1/2"
				step={5}
				onValueChange={(value) => handleValueChange(value[0])}
				orientation="vertical"
			/>
		</div>
	);
};
