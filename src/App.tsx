import { useEffect, useState } from 'react';

import { Thumbnail } from './components/Thumbnail';
import { Timeline } from './components/Timeline';
import { UriLink } from './components/UriLink';
import { VolumeSlider, VolumeSliderSkeletonLoader } from './components/VolumeSlider';

import { MediaPlaybackData, MediaSessionData, MediaTimelineData } from './utils/bindings';
import { clsx } from './utils/clsx';
import { resetTheme, updateTheme } from './utils/color';
import { rspc } from './utils/rspc';
import { getTrackData, SpotifySearchResult } from './utils/spotify';
import { tryAppendArtistFromTitle } from './utils/utils';

const LoadingSkeleton = () => {
	return (
		<>
			<div className="flex h-full min-w-0 flex-1 flex-col">
				{/* Metadata */}
				<div className="flex-grow overflow-hidden text-theme-100">
					<span className="block h-4 w-2/3 animate-pulse rounded-lg bg-theme-200 duration-200" />
					<span className="mt-1 block h-3 w-1/3 animate-pulse rounded-lg bg-theme-200 duration-200" />
				</div>

				{/* Timeline */}
				<div className="pointer-events-auto relative mr-2">
					<span className="absolute bottom-0 block h-2 w-full animate-pulse rounded-full bg-theme-200 duration-200" />
				</div>
			</div>

			<VolumeSliderSkeletonLoader />
		</>
	);
};

function App() {
	const [metadata, setMetadata] = useState<MediaSessionData | null>();
	const [playbackData, setPlaybackData] = useState<MediaPlaybackData | null>();
	const [timelineData, setTimelineData] = useState<MediaTimelineData | null>();

	const [trackData, setTrackData] = useState<SpotifySearchResult | null>();

	const { mutate: invokeMediaProperties } = rspc.useMutation('media.invokeMediaProperties');

	rspc.useSubscription(['media.mediaPropertiesChanged'], {
		onData: async (data) => {
			console.log(data);

			setMetadata({ ...data, artist: tryAppendArtistFromTitle(data.artist, data.title) });
			updateTheme(data.thumbnail.palette.shades, data.thumbnail.prominantColor);

			setTrackData(await getTrackData(data.title, data.artist, data.album));
		}
	});
	rspc.useSubscription(['media.playbackInfoChanged'], {
		onData: setPlaybackData
	});
	rspc.useSubscription(['media.timelinePropertiesChanged'], {
		onData: setTimelineData
	});
	rspc.useSubscription(['media.sessionChanged'], {
		onData: (data) => {
			console.log(`session changed: ${data.appId}`);
			if (data.appId === 'Spotify.exe' && !data.sessionActive) {
				setMetadata(null);
				setPlaybackData(null);
				setTimelineData(null);
				resetTheme();
			}
		}
	});

	useEffect(() => {
		invokeMediaProperties(undefined);
	}, []);

	const hasSession = !!metadata && !!playbackData && !!timelineData;

	return (
		<div
			data-tauri-drag-region
			className={clsx(
				'h-screen w-full select-none overflow-hidden rounded-[calc(6px+2px)] border border-theme-900/20 bg-theme-prominant/80 p-[2px] font-satoshi text-theme-prominant transition-colors',
				{
					'border-theme-500/20 bg-theme-100/80': !hasSession
				}
			)}
		>
			<div className="pointer-events-none flex h-full max-h-full">
				{/* Thumbnail */}
				<Thumbnail
					src={metadata?.thumbnail.base64}
					isPlaying={playbackData?.isPlaying}
					loading={!hasSession}
				/>

				<div className="z-10 flex min-w-0 flex-1 gap-1 py-2 px-3">
					{!hasSession ? (
						<LoadingSkeleton />
					) : (
						<>
							<div className="flex h-full min-w-0 flex-1 flex-col">
								{/* Metadata */}
								<div className="flex-grow overflow-hidden text-theme-100">
									<UriLink
										className="-my-[6px] -mx-px px-px text-base font-medium"
										uri={trackData?.tracks?.items[0]?.album.uri ?? ''}
									>
										{metadata.title}
									</UriLink>
									<UriLink
										className="text-xs leading-5 opacity-90"
										uri={trackData?.tracks?.items[0]?.artists?.[0]?.uri ?? ''}
									>
										{metadata.artist}
									</UriLink>
								</div>

								<div className="pointer-events-auto relative">
									<Timeline data={timelineData} isPlaying={playbackData?.isPlaying} />
								</div>
							</div>

							{/* Volume Slider */}
							<span className="pointer-events-auto pl-2">
								<VolumeSlider />
							</span>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default App;
