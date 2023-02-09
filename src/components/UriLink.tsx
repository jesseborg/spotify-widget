import { FC, HTMLAttributes, PropsWithChildren } from 'react';
import { clsx } from '../utils/clsx';
import { rspc } from '../utils/rspc';

type UriLinkProps = {
	uri: string;
};

export const UriLink: FC<
	PropsWithChildren<UriLinkProps> & HTMLAttributes<HTMLParagraphElement>
> = ({ uri, children, className }) => {
	const { mutate: invokeSpotifyUri } = rspc.useMutation('spotify.invokeUri');

	const hasValidUri = uri.startsWith('spotify:');

	const handleClick = () => {
		if (!hasValidUri) {
			return;
		}

		invokeSpotifyUri(uri);
	};

	return (
		<h1
			onClick={handleClick}
			className={clsx('pointer-events-auto w-fit max-w-full truncate drop-shadow-sm', className, {
				'hover:text-theme-50 hover:underline': hasValidUri
			})}
		>
			{children}
		</h1>
	);
};
