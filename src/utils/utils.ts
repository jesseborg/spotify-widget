export const tryAppendArtistFromTitle = (artist: string, title: string) => {
	const matches = title.match(/[([](?:feat\.|ft\.|with|w\/|&|and|,)\s(?<names>.+)[)\]]/);

	if (matches?.groups?.names) {
		return `${artist}, ${matches?.groups?.names}`;
	}

	return artist;
};
