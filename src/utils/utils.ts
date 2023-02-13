import { SpotifySearchResult } from './spotify';

export function getArtistInfo(name: string, data?: SpotifySearchResult | null) {
	if (!data?.tracks.items.length) {
		return null;
	}

	return data?.tracks.items?.[0].artists.find(
		(artist) => artist.name.toLowerCase() === name.toLowerCase()
	);
}

export function getArtists(data?: SpotifySearchResult | null) {
	if (!data?.tracks.items.length) {
		return null;
	}

	return data?.tracks.items?.[0].artists;
}
