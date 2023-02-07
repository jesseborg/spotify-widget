import { fetch } from '@tauri-apps/api/http';

// https://github.com/davidffa/Vulkava/blob/4c24d7ffb475a862716e43bb1c7f2db41255f440/lib/sources/Spotify.ts#L218

type AnonymousTokenResponse = {
	clientId: string;
	accessToken: string;
	accessTokenExpirationTimestampMs: number;
};

type SpotifyTokenData = {
	renewDate: number;
} & AnonymousTokenResponse;

export type SpotifyArtistData = {
	external_urls: {
		spotify: string;
	};
	href: string;
	id: string;
	name: string;
	type: string;
	uri: string;
};

export type SpotifySearchResult = {
	tracks: {
		href: string;
		items: {
			album: {
				album_type: string;
				artists: SpotifyArtistData[];
				available_markets: string[];
				external_urls: {
					spotify: string;
				};
				href: string;
				id: string;
				images: {
					height: number;
					url: string;
					width: number;
				}[];
				name: string;
				release_date: string;
				release_date_precision: string;
				total_tracks: number;
				type: string;
				uri: string;
			};
			artists: SpotifyArtistData[];
			available_markets: string[];
			disc_number: number;
			duration_ms: number;
			explicit: boolean;
			external_ids: {
				isrc: string;
			};
			external_urls: {
				spotify: string;
			};
			href: string;
			id: string;
			is_local: boolean;
			name: string;
			popularity: number;
			preview_url: string;
			track_number: number;
			type: string;
			uri: string;
		}[];
		limit: number;
		next: string | null;
		offset: number;
		previous: string | null;
		total: number;
	};
};

let timeSinceLastRequest = 0;

function getTokenData() {
	return JSON.parse(window.localStorage.getItem('spotify')!) as SpotifyTokenData;
}

export async function getAnonymousToken() {
	const { data, ok } = await fetch<AnonymousTokenResponse>(
		'https://open.spotify.com/get_access_token'
	);

	if (!ok) {
		return null;
	}

	const tokenData = {
		...data,
		renewDate: data.accessTokenExpirationTimestampMs - 5000
	};

	window.localStorage.setItem('spotify', JSON.stringify(tokenData));
	return tokenData;
}

export async function makeRequest<T>(endpoint: string) {
	// Simple 1 second rate limit
	if (timeSinceLastRequest !== 0 && Date.now() - timeSinceLastRequest < 1000) {
		return null;
	}

	const tokenData = getTokenData();
	if (!tokenData?.accessToken || tokenData?.renewDate === 0 || Date.now() > tokenData?.renewDate) {
		await getAnonymousToken();
	}

	const { data } = await fetch<T>(`https://api.spotify.com/v1/${endpoint}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${getTokenData().accessToken}`
		}
	});
	timeSinceLastRequest = Date.now();

	return data;
}

export async function getTrackData(track: string, artist: string, album?: string) {
	if (!track || !artist) {
		return null;
	}

	const data = await makeRequest<SpotifySearchResult>(
		`search?q=track:${track}+artist:${artist}+album:${album}&type=track`
	);

	console.log(data);

	return data;
}
