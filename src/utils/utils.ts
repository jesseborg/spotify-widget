import { SpotifySearchResult } from './spotify';
export function getArtistInfo(name: string, data?: SpotifySearchResult | null) {
	return data?.tracks.items?.[0].artists.find((artist) => artist.name === name);
}
