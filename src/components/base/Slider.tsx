import * as RadixSlider from '@radix-ui/react-slider';
import { forwardRef } from 'react';
import { clsx } from '../../utils/clsx';

export const Slider = forwardRef<HTMLSpanElement, RadixSlider.SliderProps>(
	({ orientation = 'horizontal', defaultValue = [50], className, ...props }, forwardedRef) => {
		const value = props.value || defaultValue;
		const isHorizontal = orientation === 'horizontal';

		return (
			<RadixSlider.Slider
				ref={forwardedRef}
				orientation={orientation}
				className={clsx(
					'group relative flex touch-none select-none items-center [&_span]:transition-all [&_span]:hover:active:transition-none',
					className,
					{
						'h-5 w-full': isHorizontal,
						'h-full w-5 flex-col': !isHorizontal
					}
				)}
				max={props.max ?? 100}
				step={1}
				aria-label="Slider"
				defaultValue={value}
				{...props}
			>
				<RadixSlider.Track
					className={clsx('relative flex-grow rounded-full bg-theme-200/50', {
						'h-1': isHorizontal,
						'w-1': !isHorizontal
					})}
				>
					<RadixSlider.Range
						className={clsx(
							'absolute rounded-full bg-theme-200 transition-colors group-focus-within:bg-theme-100 group-hover:bg-theme-100',
							{
								'h-full': isHorizontal,
								'w-full': !isHorizontal
							}
						)}
					/>
				</RadixSlider.Track>
				{value?.map((_, i) => (
					<RadixSlider.Thumb
						key={i}
						className={clsx(
							'block h-[10px] w-[10px] rounded-lg bg-theme-100 opacity-0 shadow-theme-500 transition-opacity hover:bg-theme-50 focus:outline-none group-focus-within:opacity-100 group-hover:opacity-100',
							{
								'shadow-[-2px_0_4px_-1px_var(--tw-shadow-colored)]': isHorizontal,
								'shadow-[0_2px_4px_-1px_var(--tw-shadow-colored)]': !isHorizontal
							}
						)}
					/>
				))}
			</RadixSlider.Slider>
		);
	}
);
