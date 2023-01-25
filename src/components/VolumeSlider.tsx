import { Slider } from './base/Slider';

export const VolumeSlider = () => {
	const handleValueChange = (value: number[]) => {
		console.log(value);
	};

	return (
		<div className="relative h-full w-1">
			<Slider
				className="absolute left-1/2 -translate-x-1/2"
				step={5}
				onValueChange={handleValueChange}
				orientation="vertical"
			/>
		</div>
	);
};
