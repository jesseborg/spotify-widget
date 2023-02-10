import { FC, HTMLAttributes, PropsWithChildren } from 'react';
import { useIsOnline } from '../hooks/useIsOnline';
import { clsx } from '../utils/clsx';
import { rspc } from '../utils/rspc';

type UriLinkProps = {
	uri: string;
};

export const UriLink: FC<
	PropsWithChildren<UriLinkProps> & HTMLAttributes<HTMLParagraphElement>
> = ({ uri, children, className }) => {
	const { mutate: invokeSpotifyUri } = rspc.useMutation('spotify.invokeUri');

	const isOnline = useIsOnline();

	const hasValidUri = uri.startsWith('spotify:');
	const behaveAsLink = hasValidUri && isOnline;

	const handleClick = () => {
		if (!behaveAsLink) {
			return;
		}

		invokeSpotifyUri(uri);
	};

	return (
		<h1
			onClick={handleClick}
			className={clsx('pointer-events-none w-fit max-w-full truncate', className, {
				'pointer-events-auto hover:text-theme-100 hover:underline': behaveAsLink
			})}
		>
			{children}
		</h1>
	);
};
