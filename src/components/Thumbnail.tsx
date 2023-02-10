import { AnimationEvent, FC, useEffect, useRef, useState } from 'react';

import { ReactComponent as NextIcon } from '@/assets/icons/next.svg';
import { ReactComponent as PauseIcon } from '@/assets/icons/pause.svg';
import { ReactComponent as PlayIcon } from '@/assets/icons/play.svg';
import { ReactComponent as PreviousIcon } from '@/assets/icons/previous.svg';

import { MusicalNoteIcon } from '@heroicons/react/24/solid';

import { clsx } from '../utils/clsx';
import { rspc } from '../utils/rspc';
import { Button } from './base/Button';

type Props = {
	src: string | undefined;
	loading?: boolean;
	isPlaying?: boolean;
};

const ThumbnailImage: FC<Props> = ({ src }) => {
	if (!src?.length || src === undefined) {
		return (
			<span className="absolute inset-0 w-20 bg-gradient-to-br from-spotify-thumbnail-green/40 to-spotify-thumbnail-blue/40 p-px">
				<span className="flex h-full w-full items-center justify-center rounded-[5px] bg-gradient-to-br from-spotify-thumbnail-blue to-spotify-thumbnail-green">
					<MusicalNoteIcon className="h-1/2 w-1/2" />
				</span>
			</span>
		);
	}

	return (
		<img className="h-full rounded-[5px]" draggable={false} src={`data:image/png;base64,${src}`} />
	);
};

export const Thumbnail: FC<Props> = ({ src, loading = true, isPlaying = false }) => {
	const { mutate: invokeMediaMethod } = rspc.useMutation('media.invokeMethod');

	const [isHovering, setIsHovering] = useState(false);
	const [isActive, setIsActive] = useState(false);
	const [slideInComplete, setSlideInComplete] = useState(false);

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const hasThumbnail = Boolean(src);

	const clearHoverTimeout = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	};

	const handleMouseEnter = () => {
		setIsActive(true);
		setIsHovering(true);
		clearHoverTimeout();
	};

	const handleMouseLeave = () => {
		setIsHovering(false);
		clearHoverTimeout();

		timeoutRef.current = setTimeout(() => {
			setIsActive(false);
		}, 1000);
	};

	const handleAnimationEnd = (event: AnimationEvent) => {
		if (event.animationName === 'slideIn') {
			setSlideInComplete(true);
		}
		if (event.animationName === 'slideOut') {
			setSlideInComplete(false);
		}
	};

	useEffect(() => {
		return () => clearTimeout(timeoutRef.current as NodeJS.Timeout);
	}, []);

	const showSlideIn = isHovering || isActive;
	const showSlideOut = !isHovering && !isActive && slideInComplete;

	return (
		<div
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={clsx(
				'group pointer-events-auto relative z-0 h-full w-[78px] self-center overflow-hidden rounded-md border border-theme-700',
				{
					'border-none': loading || !hasThumbnail
				}
			)}
		>
			<ThumbnailImage src={src} />

			{/* Buttons */}
			{!loading && (
				<div
					onAnimationEnd={handleAnimationEnd}
					className={clsx(
						'absolute left-0 bottom-0 z-10 flex w-full translate-y-full items-center justify-center bg-gradient-to-b from-transparent via-theme-700/80 to-theme-800 py-1 pt-2 transition-transform',
						{
							'animate-slide-in': showSlideIn,
							'animate-slide-out': showSlideOut
						}
					)}
				>
					<div className="flex">
						<Button
							tabIndex={-1}
							icon={<PreviousIcon />}
							onClick={() => invokeMediaMethod('previous')}
						/>
						{isPlaying ? (
							<Button
								tabIndex={-1}
								icon={<PauseIcon />}
								onClick={() => invokeMediaMethod('pause')}
							/>
						) : (
							<Button tabIndex={-1} icon={<PlayIcon />} onClick={() => invokeMediaMethod('play')} />
						)}
						<Button tabIndex={-1} icon={<NextIcon />} onClick={() => invokeMediaMethod('next')} />
					</div>
					{/* <div className="flex p-1">
						<Button
							tabIndex={-1}
							icon={<PreviousIcon />}
							onClick={() => invokeMediaMethod('previous')}
						/>
						{isPlaying ? (
							<Button
								tabIndex={-1}
								icon={<PauseIcon />}
								onClick={() => invokeMediaMethod('pause')}
							/>
						) : (
							<Button tabIndex={-1} icon={<PlayIcon />} onClick={() => invokeMediaMethod('play')} />
						)}
						<Button tabIndex={-1} icon={<NextIcon />} onClick={() => invokeMediaMethod('next')} />
					</div> */}
					{/* <span className="fixed inset-0 z-0 h-full bg-gradient-to-b from-transparent to-theme-800 transition-opacity" /> */}
				</div>
			)}
		</div>
	);
};
