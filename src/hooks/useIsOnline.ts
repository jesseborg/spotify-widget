import { useEffect } from 'react';
import { rspc } from './../utils/rspc';

// 'navigator.onLine' does not work with tauri...
export const useIsOnline = () => {
	const { data: isOnline, refetch } = rspc.useQuery(['network.status']);

	useEffect(() => {
		refetch();
		const timer = setInterval(() => refetch(), 1000);

		return () => {
			clearInterval(timer);
		};
	}, []);

	return isOnline;
};
